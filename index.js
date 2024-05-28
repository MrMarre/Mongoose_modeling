const express = require('express');
const mongoose = require('mongoose');
const ENV = require('dotenv').config();
const { User, Product, Order } = require('./models/orderModel');
const app = express();

app.use(express.json());

const PORT = 3000;
const URL = '127.0.0.1';

mongoose.connect(process.env.DB_URI).then(() => {
  console.log('Connected to DB.');

  app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
  });
});

app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send('User not found');
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// * Products Crud

app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/products', async (req, res) => {
  try {
    const product = Product.find();
    if (!product) {
      return res.status(404).send('No products found');
    }
    res.status(200).send(products);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

//  * Order Crud

app.post('/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('products._id');
    if (!orders) {
      res.status(404).send('no orders found');
    }
    res.status(200).send(orders);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

//  * Aggregations ---------

app.get('/users/aggregation/averageAge', async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          averageAge: { $avg: '$age' },
        },
      },
    ]);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/orders/total/:orderId', async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.orderId) } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products._id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $addFields: {
          totalPricePerProduct: {
            $multiply: ['$products.quantity', '$productDetails.price'],
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          totalPrice: { $sum: '$totalPricePerProduct' },
        },
      },
    ]);
    if (result.length === 0) {
      res.status(404).send('No products found');
      return;
    }
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
