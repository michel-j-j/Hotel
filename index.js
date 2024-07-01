const express = require('express');
const { Web3 } = require('web3');

const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON del contrato
const contractFilePath = path.join(__dirname, 'build', 'contracts', 'VirtualStore.json');

// Leer el archivo JSON
const contractJSON = fs.readFileSync(contractFilePath, 'utf-8');
const contractData = JSON.parse(contractJSON);

// Obtener ABI y dirección del contrato
const contractABI = contractData.abi;
const contractAddress = contractData.networks['5777'].address; // Reemplaza <network_id> con el ID de la red específica

// Conexión a Ganache local
const web3 = new Web3('http://127.0.0.1:7545');

const app = express();
const port = 3000;
app.use(session({ secret: 'XASDASDA' }));
var ssn;

let accounts = [];
getAccounts().then(() => {
    console.log(accounts[0])
})

async function getAccounts() {
    accounts = await web3.eth.getAccounts();
}
// Rutas y lógica de la aplicación Express

const contract = new web3.eth.Contract(contractABI, contractAddress);
const gasLimit = 500000;


async function addProduct(nombre, type, price, quantityAvailable, status) {
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.addProduct(nombre, type, price, quantityAvailable, status).send({ from: accounts[0], gas: gasLimit });
    } catch (error) {
        console.error('Error al agregar producto:', error);
    }
}

async function updateUser(id, name, username, senha, age, ethereumAddress) {
    try {
        const user = await contract.methods.updateUser(
            id,
            name,
            username,
            senha,
            age,
            ethereumAddress
        ).send({ from: ethereumAddress, gas: gasLimit });
        return
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}
async function getAllProducts() {
    try {
        const products = await contract.methods.getAllProducts().call();

        const formattedProducts = products.map(product => ({
            id: product.id.toString(),
            name: product.name,
            type: product.category,
            price: product.price.toString(),
            quantityAvailable: product.quantityAvailable.toString(),
            status: product.status
        }));
        return formattedProducts
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}

// Llamada de ejemplo para obtener y mostrar los productos
//nombre,type,price,quantityAvailable,status
addProduct('Habitacion', 'Simple', 34, 3, 'Disponible');
getAllProducts()

//Peticiones
app.get('/products', (req, res) => {
    getAllProducts().then((products) => {
        res.send(products);
    });
});

app.post('/upRoom', (req, res) => {
    const { NumeroQuarto, TipoQuarto, Preco, Status } = req.body; // Extrai os dados do formulário

    addProduct(NumeroQuarto, TipoQuarto, parseInt(Preco, 10), 1, Status).then(() => {
        res.send('Product create')
    }).catch((err) => {
        res.send('Error product create: ' + err)
    });
});

app.post("/atualizarConta", (req, res) => {
    const { nome_completo, user_name, senha, idade } = req.body; // Pega os dados inseridos na página atualizar.ejs
    ssn = req.session;

    const id = ssn.id;
    const ethereumAddress = ssn.ethereumAddress;
    const username = user_name;
    const name = nome_completo;
    const age = idade;

    updateUser(id, name, username, senha, age, ethereumAddress).then(() => {
        res.send('User Update')
    }).catch((err) => {
        console.log('Error User Update: ' + err)
    });
});

// Inicia el servidor
app.listen(port, () => {
    res.send(`App running on http://localhost:${port}`);
});