// @ts-nocheck
class CalcController {
  constructor() {
    this._audio = new Audio('click.mp3');
    this._audioOnOff = false;
    this._locale = 'pt-BR';
    this._lastOperatorDigit = '';
    this._lastNumberDigit = '';
    this._displayCalcEl = document.querySelector('#display');
    this._dateEl = document.querySelector('#data');
    this._timeEl = document.querySelector('#hora');
    this._operation = [];
    this._optionsDate = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };

    this.initialize();
    this.initButtonEvents();
    this.initKeyBoard();
    this.pasteToClipBoard();
  }

  initialize() {
    this.setDisplayDateTime();
    setInterval(() => this.setDisplayDateTime(), 1000);

    this.setLastNumberToDisplay();
    this.pasteToClipBoard();

    document.querySelectorAll('.btn-ac').forEach(btn => {
      btn.addEventListener('dblclick', event => {
        this.toggleAudio();
      });
    });
  }

  toggleAudio() {
    this._audioOnOff = !this._audioOnOff;
  }

  playAudio() {
    if (this._audioOnOff) {
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  pasteToClipBoard() {
    document.addEventListener('paste', event => {
      const dataPaste = event.clipboardData.getData('Text');
      this.displayCalc = !isNaN(dataPaste) ? parseFloat(dataPaste) : 0;
    });
  }

  copyToClipBoard() {
    const input = document.createElement('input');

    input.value = this.displayCalc;

    document.body.appendChild(input);

    input.select();

    document.execCommand('Copy');

    input.remove();
  }

  addEventListenerAll(element, events, fn) {
    events.split(' ').forEach(event => {
      element.addEventListener(event, fn, false);
    });
  }

  clearAll() {
    this._operation = [];
    this._lastNumberDigit = '';
    this._lastOperatorDigit = '';
    this.setLastNumberToDisplay();
  }

  clearEntry() {
    this._operation.pop();
    this.setLastNumberToDisplay();
  }

  getLastOperation() {
    const index = this._operation.length - 1;
    return this._operation[index];
  }

  isOperator(value) {
    return ['+', '-', '*', '%', '/'].includes(value);
  }

  setLastOperation(value) {
    const lastIndex = this._operation.length - 1;
    this._operation[lastIndex] = value;
  }

  pushOperation(value) {
    this._operation.push(value);
    if (this._operation.length > 3) {
      this.calc();
    }
  }

  getResult() {
    try {
      return eval(this._operation.join(''));
    } catch (error) {
      setTimeout(() => this.setError(), 1);
    }
  }

  calc() {
    let lastOperation = null;
    this._lastOperatorDigit = this.getLastItem();

    if (this._operation.length < 3) {
      const fisrtItem = this._operation[0];
      this._operation = [
        fisrtItem,
        this._lastOperatorDigit,
        this._lastNumberDigit
      ];
    }

    if (this._operation.length > 3) {
      lastOperation = this._operation.pop();
      this._lastNumberDigit = this.getResult();
    } else if (this._operation.length === 3) {
      this._lastNumberDigit = this.getLastItem(false);
    }

    let result = this.getResult();

    if (lastOperation === '%') {
      result /= 100;
      this._operation = [result];
    } else {
      this._operation = [result];
      if (!!lastOperation) {
        this._operation = [result, lastOperation];
      }
    }

    this.setLastNumberToDisplay();
  }

  getLastItem(isOperator = true) {
    let lastItem;
    let index = this._operation.length - 1;
    for (index; index >= 0; index--) {
      if (this.isOperator(this._operation[index]) === isOperator) {
        lastItem = this._operation[index];
        break;
      }
    }
    if (!lastItem) {
      lastItem = isOperator ? this._lastOperatorDigit : this._lastNumberDigit;
    }
    return lastItem;
  }

  setLastNumberToDisplay() {
    let lastNumberDigit = this.getLastItem(false);
    if (!lastNumberDigit) lastNumberDigit = 0;
    this.displayCalc = lastNumberDigit;
  }

  addOperation(value) {
    if (isNaN(this.getLastOperation())) {
      //string
      if (this.isOperator(value)) {
        this.setLastOperation(value);
      } else {
        this.pushOperation(parseFloat(value));
        this.setLastNumberToDisplay();
      }
    } else {
      //numero
      if (this.isOperator(value)) {
        this.pushOperation(value);
      } else {
        const newNUmber = this.getLastOperation().toString() + value.toString();
        this.setLastOperation(newNUmber);
        this.setLastNumberToDisplay();
      }
    }
  }

  setError() {
    this.displayCalc = 'Error';
  }

  initKeyBoard() {
    document.addEventListener('keyup', e => this.execBtn(e.key, true));
  }

  addDot() {
    const lastOperation = this.getLastOperation();
    const hasDotOperation =
      lastOperation &&
      typeof lastOperation === 'string' &&
      lastOperation.includes('.');

    if (hasDotOperation) return;

    if (this.isOperator(lastOperation) || !lastOperation) {
      this.pushOperation('0.');
    } else {
      this.setLastOperation(lastOperation.toString() + '.');
    }

    this.setLastNumberToDisplay();
  }
  execBtn(value, board) {
    this.playAudio();
    switch (value) {
      case 'ac':
      case 'Escape':
        this.clearAll();
        break;
      case 'ce':
      case 'Backspace':
        this.clearEntry();
        break;
      case 'soma':
      case '+':
        this.addOperation('+');
        break;
      case 'subtracao':
      case '-':
        this.addOperation('-');
        break;
      case 'divisao':
      case '/':
        this.addOperation('/');
        break;
      case 'porcento':
      case '%':
        this.addOperation('%');
        break;
      case 'multiplicacao':
      case '*':
        this.addOperation('*');
        break;
      case 'igual':
      case 'Enter':
      case '=':
        this.calc();
        break;
      case 'ponto':
      case '.':
        this.addDot();
        break;

      case 'c':
        this.copyToClipBoard();
        break;

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.addOperation(parseInt(value));
        break;

      default:
        !board && this.setError();
        break;
    }
  }

  initButtonEvents() {
    const buttons = document.querySelectorAll('#buttons >g, #parts > g');
    buttons.forEach(btn => {
      this.addEventListenerAll(btn, 'click drag', event => {
        const textBtn = btn.className.baseVal.replace('btn-', '');
        this.execBtn(textBtn);
      });

      this.addEventListenerAll(btn, 'mouseover mouseenter', () => {
        btn.style.cursor = 'pointer';
      });
    });
  }

  setDisplayDateTime() {
    this._timeEl.innerHTML = this.currentDate.toLocaleTimeString(this._locale);
    this._dateEl.innerHTML = this.currentDate.toLocaleDateString(
      this._locale,
      this._optionsDate
    );
  }

  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(value) {
    this._timeEl.innerHTML = value;
  }

  get displayCalc() {
    return this._displayCalcEl.innerHTML;
  }

  set displayCalc(value) {
    if (value.toString().length > 10) {
      this.setError();
    } else {
      this._displayCalcEl.innerHTML = value;
    }
  }

  get currentDate() {
    return new Date();
  }

  set currentDate(value) {
    this._dateEl.innerHTML = value;
  }
}
