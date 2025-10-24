import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { parseStringPromise, Builder } from 'xml2js';
import { parse } from 'path';

const app = express();
app.use(cors())
app.use(bodyParser.text({ type: 'application/xml' }));

const jsonParaXml = (obj, root = "response") => {
    const builder = new Builder({
        rootName: root,
        xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    return builder.buildObject(obj);
}

let clientes = []
let idCliente = 1;

let compras = []
let idCompra = 1;

app.get("/", (req, res) => {
    const mensagem = {
        mensagem: "Servidor rodando corretamente!",
        autor: "Guedes",
        linguagem: "XML"
    };
    res.type('application/xml').send(jsonParaXml(mensagem))
});

const porta = 3000;
app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});

    app.post("/clientes", async (req, res) => {
    try {
        const xmlData = await parseStringPromise(req.body);

        const cliente = xmlData?.cliente || {}
        console.log(cliente);

        const nome = cliente.nome?.[0];
        const email = cliente.email?.[0];

        const novoCliente = {
            id: idCliente++, nome, email
        };
        clientes.push(novoCliente);
        res.status(201).type("application/xml").send(jsonParaXml(
            { message: "Cliente criado com sucesso", cliente: novoCliente }
        ))
    } catch (error) {
        res.status(400).type("application/xml").send(
            jsonParaXml({ error: "Dados inválidos" })
        )
    }

    app.get("/clientes", (req, res) => {
        res.type("application/xml").send(
            jsonParaXml({ cliente: clientes })
        )
    });

    app.post("/compras", async (req, res) => {
        try {
            const xmlData = await parseStringPromise(req.body);

            const compra = xmlData?.compra || {}

            const idCliente = Number(compra.idCliente?.[0]);
            const produto = compra.produto?.[0];
            const valor = compra.valor?.[0];

            const cliente = clientes.find(c => c.id === Number(idCliente));
            if (!cliente) {
                res.status(404).type("application/xml").send(
                    jsonParaXml({ error: "Cliente não encontrado" })
                );
                return;
            }

            const novaCompra = {
                id: idCompra++, produto, valor, idCliente
            };
            compras.push(novaCompra);
            res.status(201).type("application/xml").send(
                jsonParaXml(
                    { message: "Compra Efetuada com sucesso", compra: novaCompra }
                )
            )
        } catch (error) {
            res.status(400).type("application/xml").send(
                jsonParaXml({ error: "Dados inválidos" })
            )
        }
    });

    app.get("/compras", (req, res) => {
        res.type("application/xml").send(
            jsonParaXml({ compra: compras })
        )
    });

})