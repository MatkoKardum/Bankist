'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2023-01-27T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
const getUsername = function (account) {
  account.username = account.owner
    .toLowerCase()
    .trim()
    .split(' ')
    .map(el => el[0])
    .join('');
};

accounts.forEach(acc => getUsername(acc));

const formatNumber = function (value) {
  return `${Intl.NumberFormat(currentAccount.locale, {
    style: 'currency',
    currency: currentAccount.currency,
  }).format(value)}`;
};

const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (account, sorted = false) {
  containerMovements.innerHTML = '';
  const movs = sorted
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach((mov, i) => {
    const date = new Date(account.movementsDates[i]);
    const formatedDate = formatMovementsDate(date, account.locale);
    const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${
              mov > 0 ? 'deposit' : 'withdrawal'
            }">${i + 1} ${mov > 0 ? 'deposit' : 'withdrawl'}</div>
            <div class="movements__date">${formatedDate}</div>
            <div class="movements__value">${formatNumber(Math.abs(mov))}</div>
          </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = function (account) {
  account.balance = account.movements.reduce((acc, curr) => acc + curr);

  labelBalance.textContent = formatNumber(account.balance);
};

const displaySummary = function (account) {
  const income = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr);
  labelSumIn.textContent = formatNumber(income);

  const outcome = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr);
  labelSumOut.textContent = formatNumber(Math.abs(outcome));

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .reduce((acc, curr) => acc + curr);
  labelSumInterest.textContent = formatNumber(interest);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = Math.floor(time / 60);
    const sec = time % 60;

    labelTimer.textContent = `${(min + '').padStart(2, 0)}:${(
      sec + ''
    ).padStart(2, 0)}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    time--;
  };

  let time = 300;

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const updateUI = function (account) {
  displayMovements(account);
  displayBalance(account);
  displaySummary(account);
};

let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount && +inputLoginPin.value === currentAccount.pin) {
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();

    labelDate.textContent = `${Intl.DateTimeFormat(currentAccount.locale, {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(new Date())}`;

    updateUI(currentAccount);

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const recieverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    recieverAcc &&
    +inputTransferAmount.value <= currentAccount.balance &&
    inputTransferTo.value !== currentAccount.username &&
    inputTransferAmount.value > 0
  ) {
    recieverAcc.movements.push(+inputTransferAmount.value);
    currentAccount.movements.push(-Number(+inputTransferAmount.value));
    recieverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());

    inputTransferTo.value = inputTransferAmount.value = '';

    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.movements.some(mov => mov >= +inputLoanAmount.value / 10) &&
    +inputLoanAmount.value > 0
  ) {
    setTimeout(function () {
      currentAccount.movements.push(+inputLoanAmount.value);
      currentAccount.movementsDates.push(new Date().toISOString());

      inputLoanAmount.value = '';
      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  inputCloseUsername;
  inputClosePin;
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === inputCloseUsername.value
    );
    accounts.splice(index, 1);

    inputClosePin.value = inputCloseUsername.value = '';
    containerApp.style.opacity = 0;
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sorted = sorted ? false : true;
  displayMovements(currentAccount, sorted);
});
