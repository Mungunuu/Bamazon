var mysql = require('mysql')
var inquirer = require('inquirer')

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bamazon'
})

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err
  console.log('Connected. Thread ID: ' + connection.threadId)
  // run the allProducts function
  console.log('id | product name | department name | price | stock quantity')
  allProducts()
})

// function which prints the all the data inside products table
function allProducts () {
  var query = connection.query('SELECT * FROM products', function (err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].item_id + ' | ' + res[i].product_name + ' | ' + res[i].department_name + ' | ' + res[i].price + ' | ' + res[i].stock_quantity)
    }
    start()
  })
}
// function which prompts the user for getting item id and quantity
function start () {
  inquirer.prompt([
    {
      name: 'item_id',
      type: 'input',
      message: 'What ID of the product would you like to buy?'
    },
    {
      name: 'quantity',
      type: 'input',
      message: 'How many units of the product would you like to buy?'
    }
  // function which is based on user's answer 
  ]).then(function (answer) {
    var queryString = `
        SELECT * FROM products 
        WHERE item_id = ${answer.item_id} 
          AND stock_quantity > ${answer.quantity}`
    connection.query(queryString, function (err, res) {
      if (res.length == 0) {
        console.log('Insufficient quantity!')
        start()
      } else {
        console.log(res)
        var totalPrice = answer.quantity * res[0].price
        console.log(`Your total is: ${totalPrice}`)
        var newQuantity = res[0].stock_quantity - answer.quantity
        updateStockQuantity(newQuantity, answer.item_id)
      }
    })
  })
}
// function which is to update the stock quantity database
function updateStockQuantity (qty, id) {
  var queryUpdate = connection.query(
    'UPDATE products SET ? WHERE ?',
    [
      {
        stock_quantity: qty
      },
      {
        item_id: id
      }
    ],
    function (error) {
      if (error) throw error
      console.log('Successfully updated')
    }
  )
}
