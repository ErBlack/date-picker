const template = require('./template');
const moment = require('moment');

class DatePicker extends HTMLElement {
    static get observedAttributes() {return ['value'];}

    constructor() {
        super();

        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);

        this._onGridClick = this._onGridClick.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onInputKeyup = this._onInputKeyup.bind(this);
        this._onInputFocus = this._onInputFocus.bind(this);
        this._onInputBlur = this._onInputBlur.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);

        this._inited = false;
        this._preventBlur = false;
        this._selectedDate = null;

        const shadow = this.attachShadow({mode: 'open'});
        const content = document.importNode(template.content, true);

        shadow.appendChild(this._initContent(content));
    }
    prev() {
        this._displayDate.subtract(1, 'month');
        this._redraw();
    }

    next() {
        this._displayDate.add(1, 'month');
        this._redraw();
    }

    get value() {
        return this._input.value;
    }

    set value(value) {
        const parsed = Date.parse(value);
        const hasSelected = this._selectedDate !== null;
        const hasPassed = !isNaN(parsed);
        const needRedraw = (!hasSelected && hasPassed) ||
            (hasSelected && this._selectedDate.isSame(parsed, 'day'));

        this._input.value = value;

        this._selectedDate = isNaN(parsed) ? null : moment(parsed);

        if (needRedraw) {
            this._displayDate = this._selectedDate.clone().startOf('month');
            this._redraw();
        }
    }
    _initContent(content) {
        const parsedDate = Date.parse(this.getAttribute('value'));

        /* elements */
        this._calendar = content.querySelector('.calendar');
        this._input = content.querySelector('input');
        this._month = content.querySelector('.month');
        this._grid = content.querySelector('.grid');

        /* value */
        this._input.value = this.getAttribute('value');

        /* subscriptions */
        this._input.addEventListener('input', this._onInput);
        this._input.addEventListener('keyup', this._onInputKeyup);
        this._input.addEventListener('focus', this._onInputFocus);
        this._input.addEventListener('blur', this._onInputBlur);

        this._grid.addEventListener('click', this._onGridClick);

        this._calendar.addEventListener('mousedown', this._onMouseDown);
        content.querySelector('.next').addEventListener('click', this.next);
        content.querySelector('.prev').addEventListener('click', this.prev);

        /* initial dates */
        this._selectedDate = isNaN(parsedDate) ? null : moment(parsedDate);
        this._currentDate = moment();
        this._displayDate = (
            this._selectedDate === null ?
                this._currentDate :
                this._selectedDate
        ).clone().startOf('month');

        this._redraw();

        return content;
    }

    _onGridClick({target}) {
        if (
            target.classList.contains('day') &&
            !target.classList.contains('selected')
        ) {
            this.value = this._displayDate.clone().date(target.dataset.date).format('MM-DD-YYYY');

            const selected = this._grid.querySelector('.selected');

            if (selected !== null) {
                selected.classList.remove('selected');
            }

            target.classList.add('selected');
        }
    }
    _onMouseDown() {
        this._preventBlur = true;
    }
    _onInput({target}) {
        const selectedDate = Date.parse(target.value);

        if (isNaN(selectedDate)) {
            if (this._selectedDate !== null) {
                const selected = this._grid.querySelector('.selected');

                if (selected !== null) {
                    selected.classList.remove('selected');
                }

                this._selectedDate = null;
            }
        } else if (this._selectedDate === null || !this._selectedDate.isSame(selectedDate, 'month')) {
            this._selectedDate = moment(selectedDate);
            this._displayDate = this._selectedDate.clone().startOf('month');
            this._redraw();
        }
    }
    _onInputKeyup(e) {
        if (e.keyCode === 27) {
            this._input.blur();

            e.preventDefault();
        }
    }
    _onInputFocus() {
        this._calendar.classList.remove('hidden');
    }
    _onInputBlur() {
        if (this._preventBlur) {
            this._preventBlur = false;

            this._input.focus();
        } else {
            this._calendar.classList.add('hidden');
        }
    }
    _redraw() {
        this._updateMonth();
        this._updateGrid();
    }
    _updateMonth() {
        this._month.innerText = this._displayDate.format('MMMM YYYY');
    }
    _updateGrid() {
        const grid = document.createDocumentFragment();
        const length = this._displayDate.daysInMonth();
        const currentDay = this._displayDate.isSame(this._currentDate, 'month') ? this._currentDate.date() : null;
        const selectedDay = this._displayDate.isSame(this._selectedDate, 'month') ? this._selectedDate.date() : null;

        let dayOfWeek = (this._displayDate.weekday() + 6) % 7;
        let week = 0;

        for (let i = 1; i <= length; i++) {
            const day = document.createElement('div');

            day.classList.add('day');
            day.classList.add(`d_${dayOfWeek}`);

            if (i === selectedDay) {
                day.classList.add('selected');
            }

            if (i === currentDay) {
                day.classList.add('today');
            }

            day.dataset.date = i;

            day.style.left = `${dayOfWeek * 24}px`;
            day.style.top = `${week * 24}px`;

            day.innerText = i;

            if (dayOfWeek === 6) {
                dayOfWeek = 0;

                if (i !== length) {
                    week++;
                }
            } else {
                dayOfWeek++;
            }

            grid.appendChild(day);
        }

        this._grid.innerHTML = '';
        this._grid.style.height = `${(week + 1) * 24}px`;
        this._grid.appendChild(grid);
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'value') {
            this.value = newVal;
        }
    }
}

customElements.define('date-picker', DatePicker);