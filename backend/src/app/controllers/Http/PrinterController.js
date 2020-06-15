/* eslint-disable consistent-return */
const path = require('path');
const fs = require('fs');
const { exec } = require('shelljs');
const Sale = require('../../models/Sale');
const Shop = require('../../models/Shop');

function createRecipe(itens) {
  const products = itens.map((item) => {
    return `
Produto: ${item.product.name} /quan.:${Number(item.quantity)}
-Preço uni.: R$${parseFloat(item.product.price).toFixed(2)} preço tot.: R$${(
      parseFloat(item.product.price) * Number(item.quantity)
    ).toFixed(2)}
    `;
  });
  return products;
}

module.exports = {
  async store(req, res) {
    const { id, details } = req.body;

    const sale = await Sale.findOne({ _id: id }).populate('itens.product').populate('functionary');

    const shop = await Shop.findOne();

    if (!sale) {
      return res.status(400).json({ message: 'Sale does not exist' });
    }

    const items = createRecipe(sale.itens);
    const date = String(sale.createdAt).split('.')[0];

    let data = `====================================\n`;
    data += `COMPROVANTE DE VENDA\n\n`;
    data += `${shop.name}\n\n`;
    data += `CPF/CNPJ: ${shop.identification}\n`;
    data += `Tel.: ${shop.phone}\n`;
    data += `End.: ${shop.address}\n\n`;
    data += `====================================\n\n`;
    data += `CUPOM NÃO FISCAL\n\n`;
    data += `====================================\n\n`;
    data += `Data: ${date}\n\n`;
    data += `-----------------------------------------------------------\n\n`;
    data += `${items}\n\n`;
    data += `====================================\n\n`;
    data += `Valor total: R$${sale.total.toFixed(2)}\n`;
    data += details ? `Responsavel: ${sale.functionary.name}\n` : '\n';
    data += `Forma de pagamento: ${sale.payment}\n\n`;
    data += `====================================\n\n`;
    data += `ID venda: ${sale._id}`;

    const dir =
      process.env.NODE_ENV === 'test'
        ? path.resolve(__dirname, '..', '..', '..', '..', '__tests__', 'recipes')
        : process.env.DIR_PRODUCTION;

    await fs.writeFile(`${dir}/${id}.rtf`, data, { encoding: 'utf-8', flag: 'w' }, (err) => {
      if (err) return res.status(400).json(`${err}`);
    });
    const vbs = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '__tests__',
      'recipes',
      'impressao.vbs'
    );
    exec(vbs);
    return res.status(200).json('success');
  },
};

/*
shell.openItem("C://gresppro-x64//executaveis_modulos//impressao.vbs")
*/