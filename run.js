// const Register = require('./register');
const CompileDeploy = require('./compile_deploy')
const Web3 = require('web3')
const fs = require('fs')
const config  = require('./config.json')


const {endpoint, account, cost} = config;

async function run() {

    let disAddress = "";
    let upgradeAddress = "";
    const path1 = './build/DispatcherContractAddress.txt';
    const path2 = './build/UpgradeContractAddress.txt';

    if(fs.existsSync(path1) && fs.existsSync(path2)) {
        disAddress = fs.readFileSync(path1);
        upgradeAddress = fs.readFileSync(path2);
    }

    if(disAddress == "" || upgradeAddress == "") {
        console.log("Deploy contracts now...");
        await CompileDeploy("Upgrade");
        await CompileDeploy("Dispatcher");
        disAddress = fs.readFileSync(path1);
        upgradeAddress = fs.readFileSync(path2);
    }

    console.log("disAddress: " + disAddress);
    console.log("upgradeAddress: " + upgradeAddress);

    const web3 =  new Web3(new Web3.providers.HttpProvider(endpoint));
    web3.personal.unlockAccount(account.address, account.password);

    disAbi = fs.readFileSync('./build/Dispatcher.abi');

    const disContract = web3.eth.contract(JSON.parse(disAbi));
    const disToken = disContract.at(disAddress.toString());

    const bContract = web3.eth.contract(JSON)
    // console.log(disToken.getZ.call().toString());

    await disToken.replace.sendTransaction(upgradeAddress.toString(), {from: "0x3ae88fe370c39384fc16da2c9e768cf5d2495b48", gas: 3000000});
    let result = 0;

    //过滤log1 "weige"的事件
    // let hex = '0x' + Buffer.from("weige", 'utf8').toString("hex");
    // for(let i = hex.length; i < 66; i++) {
    //     hex += '0';
    // }
    // const filter = web3.eth.filter({topics: [hex]});
    // filter.watch(function (error, log) {
    //     //得到setZ()内存0x0到32位置的值
    //     console.log(log.data);
    //     result = parseInt(log.data); 
    //     console.log("result: " + result);  
    //     filter.stopWatching();      
    //   });
    
    //如果方法是constant，则直接调用方法默认为"call()"(否则默认为sendTransacation)，不会改变合约的 z 变量，且只有通过call()来调合约函数，外部js才能通过return得到返回值，
    //而通过sendTransaction()方法调用时，add()方法中的delegatecall()还是会修改掉合约的 z 值，即使方法是constant，此时得到的返回值为transaction's hash
    //参考https://ethereum.stackexchange.com/questions/25200/solidity-what-is-the-difference-between-view-and-constant
    //https://ethereum.stackexchange.com/questions/765/what-is-the-difference-between-a-transaction-and-a-call
    //Since it is asynchronous, the immediate return value of a transaction is always the transaction's hash. To get the "return value" of a transaction to a function, Events need to be used
    await disToken.add(22, 10, {from: "0x3ae88fe370c39384fc16da2c9e768cf5d2495b48", gas: 4000000}, (err, res) => {
        console.log("======res:\n", res.toString());
        disToken.z((e, r) => {
            console.log(r.toString());
        });
    });
    // setTimeout(disToken.z((e, r) => {
    //     console.log(r.toString());
    // }), 10000);
    // console.log(disToken.getZ.call().toString());
    // filter.stopWatching();
}

run()

