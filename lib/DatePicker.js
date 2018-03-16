const template = require('./template');
const moment = require('moment');

class DatePicker extends HTMLElement {
    static get observedAttributes() {return ['value'];}

    constructor() {
        super();

        [
            '_onGridClick',
            '_onInput',
            '_onInputBlur',
            '_onInputFocus',
            '_onInputKeyup',
            '_onMouseDown',
            '_onNextClick',
            '_onPrevClick',
        ].forEach((method) => {
            this[method] = this[method].bind(this)
        });

        this._contentDrawn = false;
        this._preventBlur = false;
        this._selectedDate = null;

        const shadow = this.attachShadow({mode: 'open'});
        const content = document.importNode(template.content, true);

        shadow.appendChild(
            this._initContent(content)
        );
    }
    /**
     * Handle element first time connected to document
     */
    connectedCallback() {
        if (this._contentDrawn === false) {
            this._contentDrawn = true;
            this._redraw();
        }
    }
    /**
     * Handle element attrivutes changed
     * @param {String} attrName
     * @param {String} oldVal
     * @param {String} newVal
     */
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'value') {
            this.value = newVal;
        }
    }
    /**
     * Show prev month
     */
    prev() {
        this._displayDate.subtract(1, 'month');
        this._redraw();
    }
    /**
     * Show next month
     */
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

        this._handleChange(parsed);
    }
    _handleChange(parsed) {
        this.dispatchEvent(
            new CustomEvent('input', {
                detail: parsed,
                bubbles: true
            })
        );
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: parsed,
                bubbles: true
            })
        );
    }
    _initContent(content) {
        const parsedDate = Date.parse(this.getAttribute('value'));

        /* input */
        this._input = content.querySelector('input');
        this._input.value = this.getAttribute('value');
        this._input.addEventListener('input', this._onInput);
        this._input.addEventListener('keyup', this._onInputKeyup);
        this._input.addEventListener('focus', this._onInputFocus);
        this._input.addEventListener('blur', this._onInputBlur);

        /* calendar */
        this._calendar = content.querySelector('.calendar');
        this._calendar.addEventListener('mousedown', this._onMouseDown);

        /* grid */
        this._grid = content.querySelector('.grid');
        this._grid.addEventListener('click', this._onGridClick);

        /* moth */
        this._month = content.querySelector('.month');

        /* arrows */
        content.querySelector('.next').addEventListener('click', this._onNextClick);
        content.querySelector('.prev').addEventListener('click', this._onPrevClick);

        /* initial dates */
        this._selectedDate = isNaN(parsedDate) ? null : moment(parsedDate);
        this._currentDate = moment();
        this._displayDate = (
            this._selectedDate === null ?
                this._currentDate :
                this._selectedDate
        ).clone().startOf('month');

        return content;
    }
    /**
     * Handle prev click
     */
    _onPrevClick() {
        this.prev();
    }
    /**
     * Handle next click
     */
    _onNextClick() {
        this.next();
    }
    /**
     * Handle grid click
     * @param {Event} e
     * @param {HTMLElement} e.target
     */
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
    /**
     * Handle calendar mouse down
     */
    _onMouseDown() {
        this._preventBlur = true;
    }
    /**
     * Handle input
     * @param {Event} e
     * @param {HTMLInputElement} e.target
     */
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

        this._handleChange(selectedDate);
    }
    /**
     * Handle input keyup
     * @param {Event} e 
     */
    _onInputKeyup(e) {
        if (e.keyCode === 27) {
            this._input.blur();

            e.preventDefault();
        }
    }
    /**
     * Handle input focus
     */
    _onInputFocus() {
        this._calendar.classList.remove('hidden');
    }
    /**
     * Handle input blur
     */
    _onInputBlur() {
        if (this._preventBlur) {
            this._preventBlur = false;

            this._input.focus();
        } else {
            this._calendar.classList.add('hidden');
        }
    }
    /**
     * Update calendar view
     */
    _redraw() {
        this._updateMonth();
        this._updateGrid();
    }
    /**
     * Update month name
     */
    _updateMonth() {
        this._month.innerText = this._displayDate.format('MMMM YYYY');
    }
    /**
     * Update days grid
     */
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
}

customElements.define('date-picker', DatePicker);