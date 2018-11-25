#!/usr/bin/env node

const inquirer = require('inquirer');
const bcrypt = require('bcrypt-nodejs');
const redis = require('redis');
const client = redis.createClient();
require('../app/logic')

//Questions asked at the beginning
var questions = [
    {
        message: "Please login if you have the account or register to setup the bank account",
        type: "list",
        name: "bankAccount",
        choices: ['Register','Login']
    }

];
inquirer.prompt(questions).then((answers) => {
    if (`${answers.bankAccount}` === 'Register') {
        registerUser();
    }
    else{
        signInUser();
    }
});

/*
This method prompts user to register in-order to access the bank account
 */
registerUser = function () {
    let questions = [
        {
            message: "Please set a valid username:",
            type: "input",
            name: "Username",
            validate: validateInput
        },
        {
            message: "Please set a valid password:",
            type: "password",
            name: "Password",
            validate: validatePassword
        }
    ];
    inquirer.prompt(questions).then((answers) => {
        client.exists(`${answers.Username}`, function (err, res) {
            if (err)
                throw err;
            else if (res === 1) {
                console.log('Username already taken ... Please try another one');
                registerUser();
            }
            else {
                client.hmset(`${answers.Username}`, ['password', bcrypt.hashSync(`${answers.Password}`, null, null), 'Deposits', 0]); //hash passwords
                console.log('Registered Successfully ... Please proceed to sign-in');
                signInUser();
            }
        });

    });
};
/*
This method prompt the user to login in-order to access the bank account
 */
signInUser = function () {
    let questions = [
        {
            message: "Enter your username to login:",
            type: "input",
            name: "Username"
        },
        {
            message: "Enter your password:",
            type: "password",
            name: "Password"
        }
    ];
    inquirer.prompt(questions).then((answers) => {
        client.exists(`${answers.Username}`, function (err, res) {
            if (err)
                throw err;
            else if (res === 1) {
                client.hget(`${answers.Username}`, 'password', function (err, res) {
                    if (err)
                        throw err;
                    else if (bcrypt.compareSync(`${answers.Password}`, res)) { //compare hashed password with the actual password
                        console.log('Logged in Successfully');
                        setTimeout(function () {
                            bankBalance(`${answers.Username}`);
                        }, 1000);
                    }
                    else {
                        console.log('Oops...Wrong Password!');
                        signInUser();
                    }
                });
            }
            else if (res === 0){
                console.log('No user with that username...');
                signInUser();
            }
        });
    });
};

/*
This method acts a controller for handling requests made by the user
This method invokes the logic based on user's selection
 */
bankBalance = function (username) {
    let questions = [
        {
            message: "What would you like to do?",
            type: "list",
            name: "bankBal",
            choices: ['Deposit', 'Withdraw', 'Check Balance', 'Transaction History', new inquirer.Separator(), 'Logout']
            //validate: validateInput //to-do
        }
    ];
    inquirer.prompt(questions).then((answers) => {
        if (`${answers.bankBal}` === 'Logout') {
            console.log('Good Bye');
            client.quit();
            process.exit();
        }
        else if (`${answers.bankBal}` === 'Deposit') {
            let questions = [
                {
                    message: "How much amount are you depositing?",
                    type: "input",
                    name: "moneyToBeDeposited",
                    validate: validateValue
                }
            ];
            inquirer.prompt(questions).then(answers1 => {
                makeDeposit(username, `${answers1.moneyToBeDeposited}`);
            });
        }
        else if (`${answers.bankBal}` === 'Withdraw') {
            let questions = [
                {
                    message: "How much amount do you want to withdraw?",
                    type: "input",
                    name: "amountToBeWithdrawn",
                    validate: validateValue
                }
            ];
            inquirer.prompt(questions).then(answers => {
                makeWithdrawl(username, `${answers.amountToBeWithdrawn}`);
            });
        }
        else if (`${answers.bankBal}` === 'Check Balance') {
                checkBalance(username);
        }
        else if (`${answers.bankBal}` === 'Transaction History') {
                checkTransaction(username);
        }
    });
};

//methods performing validation checks
validateInput = function (answers) {
    if(answers === '')
        return answers!='';
    var reg =/^[a-zA-Z0-9.\-_$@*!]{3,20}$/;
        return reg.test(answers) || "Username should be in between 3 to 20 characters, it should not contain any spaces or ','";
}
validatePassword = function (password) {
    if(password === '')
        return answers!='';
    var reg = /^[A-Za-z0-9_.@#$*!^]{6,20}$/;
    return reg.test(password) || "Password should be in between 6 to 20 characters with at least one special character";
}
validateValue = function (value) {
    var reg = /^\d+(\.\d{1,2})?$/;
        return reg.test(value) || "Amount should be a number!";
}

module.exports = {bankBalance};