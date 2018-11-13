/*
This is Javascript file consists of the logic which is used by the application
 */
const redis = require('redis');
const client = redis.createClient();
const currency = '$';
require('../config/inquirer')

/*
The method makeDeposit is to make deposits into the bank account. The method takes
username and the amount of money to be deposited
 */
makeDeposit = function (username, moneyToBeDeposited) {
    client.hget(username, 'Deposits', function (err, reply) {
        if (err)
            throw err;
        let money = Number(reply) + Number(moneyToBeDeposited);
        client.hmset(username, 'Deposits', money);
        console.log('Amount deposited in your account - '+ money+currency);
        client.lpush([username + 'key', moneyToBeDeposited], function (err) {
            if (err)
                throw err;
        });
    });
    setTimeout(function () {
        bankBalance(username);
    }, 3000);
};


/*
This method makeWithdrawl is for the withdrawl of amount from the existing bank account.
The method takes username and the amount to be withdrawn from the account by the user.
 */
makeWithdrawl = function (username, amountToBeWithdrawn) {
    client.hget(username, 'Deposits', function (err, res) {
        if (err)
            throw err;
        let money = Number(amountToBeWithdrawn);
        console.log(money);
        if (money < res) {
            console.log('Amount Withdrawn - '+ amountToBeWithdrawn+currency);
            let newBalance = res - amountToBeWithdrawn;
            client.hmset(username, 'Deposits', newBalance);
            let money = -amountToBeWithdrawn;
            client.lpush(username + 'key', money, function (err) {
                if (err)
                    throw err;
            });
        }
        else console.log('Sorry...You do not have enough money to make this transaction');
    });
    setTimeout(function () {
        bankBalance(username);
    }, 3000);
};

/*
This method checkTransaction
 */
checkTransaction = function (username) {
    client.lrange(username + 'key', 0, -1, function (err, responseArray) {
        if (err)
            throw err;
        if(responseArray.length > 0) {
            client.llen(username + 'key', function (err, length) {
                if (err)
                    throw err;
                for (var i = 0; i < length; i++) {
                    if (responseArray[i] < 0) {
                        let amount = -responseArray[i];
                        console.log('Withdrawn Amount - ' + amount + currency);
                    }
                    else {
                        console.log('Deposited Amount - ' + responseArray[i] + '$');
                    }
                }
            });
        }
        else console.log('No Transactions made till now');

    });
    setTimeout(function () {
        bankBalance(username);
    }, 5000);
};

/*
This method checkBalance is used to check balance in the existing bank account.
The method takes username as an argument and retrieves the information.
 */
checkBalance = function (username) {
    client.hget(username, 'Deposits', function (err, response) {
        if (err)
            throw err;
        console.log('Current Balance in your account is: ' + response+ currency);
    });
    setTimeout(function () {
        bankBalance(username);
    }, 5000);
};


module.exports = {makeDeposit, makeWithdrawl, checkTransaction};