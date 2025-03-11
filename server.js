const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mysql');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const con = sql.createConnection(
  {
    host : 'database-2.c7gs8uw62z91.eu-north-1.rds.amazonaws.com',
    user : 'admin',
    password : 'rootadmin',
    database : 'cruise_ship',
    port : 3306
  }
);

con.connect((err)=>{
  if(err) throw err;
  console.log('Connected');
});

app.get('/users', async(req,res) =>{
    try{
        
        con.query('SELECT * FROM users',async (err,result)=>{
            if(err)
              return res.status(500).json({error : err});

            res.status(200).json(result);
        });
    }catch(err){
      res.status(500).json({error : err});
    }
});

app.post('/login',async (req,res)=>{
  const {email,password} = req.body;
  try{
    let q = 'SELECT * FROM users WHERE email = ?';
    
    con.query(q,[email],async(err,result)=>{
      if(err)
        return res.status(500).json({error : err});
      
      if(result[0]['password']==password){
        res.status(200).json({id:result[0]['id'],type:result[0]['type']});
      }else{
        res.status(200).json({message: 'Invalid credentials', ress : result[0]})
      }
    });
        
  }catch(err){
    res.status(500).json({'error': err});
  }
});

app.delete('/deleteitem/:id', (req, res) => {
  const itemId = req.params.id;

  if (!itemId) {
    return res.status(400).json({ message: "Missing item ID" });
  }

  const q = "DELETE FROM StationeryItems WHERE ItemID = ?";

  con.query(q, [itemId], (err, result) => {
    if (err) {
      console.error("❌ Delete Error:", err);
      return res.status(500).json({ message: "Failed to delete item", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("✅ Delete Success:", result);
    res.status(200).json({ message: "Item deleted successfully", itemId });
  });
});

app.post('/addfooditem', (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Missing name or price" });
  }

  const q = "INSERT INTO FoodItems (ItemName, Price) VALUES (?, ?)";
  con.query(q, [name, price], (err, result) => {
    if (err) {
      console.error("❌ Insert Error:", err);
      return res.status(500).json({ message: "Failed to add item", error: err });
    }
    res.status(201).json({ message: "Item added successfully", itemId: result.insertId });
  });
});

app.put('/updatefooditem/:id', (req, res) => {
  const itemId = req.params.id;
  const { price } = req.body;

  if (!price) {
    return res.status(400).json({ message: "Missing price" });
  }

  const q = "UPDATE FoodItems SET Price = ? WHERE ItemID = ?";
  con.query(q, [price, itemId], (err, result) => {
    if (err) {
      console.error("❌ Update Error:", err);
      return res.status(500).json({ message: "Failed to update price", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Price updated successfully" });
  });
});

app.delete('/deletefooditem/:id', (req, res) => {
  const itemId = req.params.id;

  const q = "DELETE FROM FoodItems WHERE ItemID = ?";
  con.query(q, [itemId], (err, result) => {
    if (err) {
      console.error("❌ Delete Error:", err);
      return res.status(500).json({ message: "Failed to delete item", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  });
});


app.post("/orders",(req,res)=>{

  const {customerID,totalAmount} = req.body
  if(!customerID||!totalAmount){
    res.status(500).json({msg: 'Invalid Data'});
  }
  const date = new Date().toISOString().split("T")[0];
  console.log(date);
  const query = "INSERT INTO Orders (OrderDate, CustomerID, Amount) VALUES (?, ?, ?)";
  con.query(query,[date,customerID,totalAmount],(err,results)=>{
    if(err){
      res.status(500).json({msg: err})
    }
    res.status(200).json(results['insertId']);
  });
});

app.post("/orderitem",(req,res)=>{
  const {orderId,itemId,quantity} = req.body;
  const query = "INSERT INTO OrderItems (OrderID, ItemID, Quantity) VALUES (?, ?, ?)";
  con.query(query,[orderId,itemId,quantity],(err,result)=>{
    if(err){
      res.status(500).json({msg: 'error occured',error: err})
    }
    res.status(200).json(result['insertId']);
  })
});

app.post("/checkout", (req, res) => {
  const { customerID, cart, category } = req.body;
  if (!customerID || !cart || Object.keys(cart).length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const orderDate = new Date().toISOString().split("T")[0];
  const totalAmount = Object.values(cart).reduce((sum, item) => {
    const price = item.Price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  console.log(totalAmount);

  const orderquery = "INSERT INTO Orders (OrderDate, CustomerID, Amount, Category) VALUES (?, ?, ?, ?)";
  con.query(orderquery, [orderDate, customerID, totalAmount,category], (err, results) => {
    if (err) {
      return res.status(500).json({ msg: "Error inserting order", error: err });
    }

    const orderId = results.insertId;
    const cartArray = Object.values(cart);

    // Convert each insert into a promise
    const insertPromises = cartArray.map((item) => {
      return new Promise((resolve, reject) => {
        const query = "INSERT INTO OrderItems (OrderID, ItemID, Quantity) VALUES (?, ?, ?)";
        con.query(query, [orderId, item.ItemID, item.quantity], (err, result) => {
          if (err) {
            reject(err);
          } else {
            console.log(`Inserted Item: ${item.ItemID}, Quantity: ${item.quantity}, Price: ${item.Price}`);
            resolve(result);
          }
        });
      });
    });

    // Wait for all OrderItems inserts to complete before responding
    Promise.all(insertPromises)
      .then(() => {
        res.status(200).json({ msg: "Order placed successfully", orderId });
      })
      .catch((err) => {
        res.status(500).json({ msg: "Error inserting order items", error: err });
      });
  });
});

app.post("/booksalon", (req, res) => {
  const { userId, cart } = req.body;

  if (!userId || !cart || Object.keys(cart).length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const orderDate = new Date().toISOString().split("T")[0];
  const category = "beautySalon";

  // 🔸 Calculate Total Amount
  const totalAmount = Object.values(cart).reduce((sum, item) => {
    return sum + (item.Price ?? 0) * item.quantity;
  }, 0);

  console.log("Total Amount:", totalAmount);

  // 🔸 Insert into Orders Table
  const orderQuery = "INSERT INTO Orders (OrderDate, CustomerID, Amount, Category) VALUES (?, ?, ?, ?)";
  con.query(orderQuery, [orderDate, userId, totalAmount, category], (err, results) => {
    if (err) return res.status(500).json({ msg: "Error inserting order", error: err });

    const orderId = results.insertId;
    console.log("New Order ID:", orderId);

    // 🔸 Insert into OrderItems Table
    const insertPromises = Object.values(cart).map((item) => {
      return new Promise((resolve, reject) => {
        const query = "INSERT INTO SalonOrderItems (OrderID, ItemID, Quantity) VALUES (?, ?, ?)";
        con.query(query, [orderId, item.ServiceID, item.quantity], (err, result) => {
          if (err){
            console.log(err);
            reject(err);
          }
          else resolve(result);
        });
      });
    });

    Promise.all(insertPromises)
      .then(() => res.status(200).json({ msg: "Order placed successfully", orderId }))
      .catch((err) => res.status(500).json({ msg: "Error inserting order items", error: err }));
  });
});

app.post("/registration", (req, res) => {
  const { name, email, password, phone, cabinNumber } = req.body;

  if (!name || !email || !password || !phone || !cabinNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const sql = "INSERT INTO users (name, email, password, phone_no, cabin_no, type) VALUES (?, ?, ?, ?, ?,'voyager')";
  con.query(sql, [name, email, password, phone, cabinNumber], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email or Cabin Number already exists." });
      }
      console.error("❌ Database Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({ message: "Registration successful!", userId: result.insertId });
  });
});

app.post('/additems', (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    console.log("❌ Missing data:", req.body);
    return res.status(400).json({ message: "Missing name or price" });
  }

  console.log("✅ Received Data:", { name, price });

  const q = "INSERT INTO StationeryItems (ItemName, Price) VALUES (?, ?)";
  
  con.query(q, [name, price], (err, result) => {
    if (err) {
      console.error("❌ Database Error:", err);
      return res.status(500).json({ message: "Failed to add item", error: err });
    }
    
    console.log("✅ Insert Success:", result);
    res.status(201).json({ message: "Item added successfully", itemId: result.insertId });
  });
});



app.get('/orderedstatoneryitems',(req,res)=>{
  const q = 'SELECT si.*, oi.Quantity, o.OrderID, o.OrderDate, o.CustomerID FROM OrderItems oi JOIN Orders o ON oi.OrderID = o.OrderID JOIN StationeryItems si ON oi.ItemID = si.ItemID WHERE o.Category = "Stationery"'
  con.query(q,async (err,results)=>{
    if(err)
      res.status(500).json(err);

    res.status(200).json({result : results})

  })
});

app.post("/bookmovies", (req, res) => {
  const { userId, cart } = req.body;

  if (!userId || !cart || Object.keys(cart).length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const orderDate = new Date().toISOString().split("T")[0];
  const category = "movie";

  // 🔸 Calculate Total Amount
  const totalAmount = Object.values(cart).reduce((sum, item) => {
    return sum + (item.Price ?? 0) * item.quantity;
  }, 0);

  console.log("Total Amount:", totalAmount);

  // 🔸 Insert into Orders Table
  const orderQuery = "INSERT INTO Orders (OrderDate, CustomerID, Amount, Category) VALUES (?, ?, ?, ?)";
  con.query(orderQuery, [orderDate, userId, totalAmount, category], (err, results) => {
    if (err) return res.status(500).json({ msg: "Error inserting order", error: err });

    const orderId = results.insertId;
    console.log("New Order ID:", orderId);

    // 🔸 Insert into OrderItems Table
    const insertPromises = Object.values(cart).map((item) => {
      return new Promise((resolve, reject) => {
        const query = "INSERT INTO MovieBooking (OrderID, MovieID, Quantity) VALUES (?, ?, ?)";
        con.query(query, [orderId, item.MovieID, item.quantity], (err, result) => {
          if (err){
            console.log(err);
            reject(err);
          }
          else resolve(result);
        });
      });
    });

    Promise.all(insertPromises)
      .then(() => res.status(200).json({ msg: "Order placed successfully", orderId }))
      .catch((err) => res.status(500).json({ msg: "Error inserting order items", error: err }));
  });
});



// 📌 Fetch movie bookings with movie details
app.get("/getMovieBookings", (req, res) => {
  const query = `
    SELECT 
      b.BookingID, 
      b.OrderID, 
      b.MovieID, 
      b.Quantity, 
      m.MovieName, 
      m.Genre, 
      m.Price, 
      m.SeatsAvailable
    FROM MovieBooking b
    JOIN MoviesList m ON b.MovieID = m.MovieID
  `;

  con.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error:", err);
      return res.status(500).json({ message: "Failed to fetch movie bookings", error: err });
    }
    res.status(200).json({ results });
  });
});


app.post("/bookgymservice", (req, res) => {
  const { userId, cart } = req.body;

  if (!userId || !cart || Object.keys(cart).length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const orderDate = new Date().toISOString().split("T")[0];
  const category = "gym";

  // 🔸 Calculate Total Amount
  const totalAmount = Object.values(cart).reduce((sum, item) => {
    return sum + (item.Price ?? 0) * item.quantity;
  }, 0);

  console.log("Total Amount:", totalAmount);

  // 🔸 Insert into Orders Table
  const orderQuery = "INSERT INTO Orders (OrderDate, CustomerID, Amount, Category) VALUES (?, ?, ?, ?)";
  con.query(orderQuery, [orderDate, userId, totalAmount, category], (err, results) => {
    if (err) return res.status(500).json({ msg: "Error inserting order", error: err });

    const orderId = results.insertId;
    console.log("New Order ID:", orderId);

    // 🔸 Insert into OrderItems Table
    const insertPromises = Object.values(cart).map((item) => {
      return new Promise((resolve, reject) => {
        const query = "INSERT INTO GymOrderItems (OrderID, ItemID, Quantity) VALUES (?, ?, ?)";
        con.query(query, [orderId, item.ServiceID, item.quantity], (err, result) => {
          if (err){
            console.log(err);
            reject(err);
          }
          else resolve(result);
        });
      });
    });

    Promise.all(insertPromises)
      .then(() => res.status(200).json({ msg: "Order placed successfully", orderId }))
      .catch((err) => res.status(500).json({ msg: "Error inserting order items", error: err }));
  });
});


app.post('/bookpartyhall', async (req, res) => {
  const { hallName, bookingDate, capacity, fromTime, toTime, price } = req.body;

  const query = `
    INSERT INTO PartyHallBooking (HallName, BookingDate,Capacity, FromTime, ToTime, TotalPrice) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  con.query(query, [hallName, bookingDate, capacity, fromTime, toTime, price], (err, result) => {
    if (err) {
      console.error("Database Error:", err); // Log error in console
      return res.status(500).json({ error: err.message || err });
    }
    res.status(200).json({ msg: "Party Hall Booking Successful", result });
  });
});

app.post('/partyhallavailability',async (req,res)=>{
  const {hallName,bookingDate,fromTime,toTime} = req.body;
  const query = 'SELECT * FROM PartyHallBooking WHERE HallName = ? AND BookingDate = ? AND ((? BETWEEN FromTime AND ToTime) OR (? BETWEEN FromTime AND ToTime) OR (FromTime BETWEEN ? AND ?))'
  con.query(query,[hallName,bookingDate,fromTime,toTime,fromTime,toTime],(err,result)=>{
    if (err) {
      console.error("Database Error:", err); // Log error in console
      return res.status(500).json({ error: err.message || err });
    }
    res.status(200).json({ msg: "the result is", result: result.length==0 });
  });
});


app.get('/getfooditems', async(req,res)=>{
  const q = 'SELECT * FROM FoodItems';
  con.query(q,(err,results) =>{
    if(err)
      res.status(500).json({error : err});

    res.status(200).json({results : results});

  });
});

app.get('/getstationeryitems', async(req,res)=>{
  const q = 'SELECT * FROM StationeryItems';
  con.query(q,(err,results) =>{
    if(err)
      res.status(500).json({error : err});

    res.status(200).json({results : results});

  });
});

app.get('/getmovieslist', async(req,res)=>{
  const q = 'SELECT * FROM MoviesList';
  con.query(q,(err,results) =>{
    if(err)
      res.status(500).json({error : err});

    res.status(200).json({results : results});

  });
});

app.get('/getbeautysalonlist', async(req,res)=>{
  const q = 'SELECT * FROM BeautySalonServices';
  con.query(q,(err,results) =>{
    if(err)
      res.status(500).json({error : err});

    res.status(200).json({results : results});

  });
});

app.get('/getgymservices', async(req,res)=>{
  const q = 'SELECT * FROM GymServices';
  con.query(q,(err,results) =>{
    if(err)
      res.status(500).json({error : err});

    res.status(200).json({results : results});

  });
});

app.get('/getPartyHallBookings',async (req,res)=>{
  const q = 'SELECT * FROM PartyHallBooking';
  con.query(q,(err,results) =>{
    if(err)
      res.status(500).json({error : err});

    res.status(200).json({results : results});

  });
})

app.get('/getSalonBookings',async (req,res)=>{
  const q = 'SELECT ServiceName , Price FROM BeautySalonServices WHERE ServiceID IN (SELECT ItemID FROM SalonOrderItems )'
  con.query(q,(err,results)=>{
    if(err)
      res.status(500).json({error : err})

    res.status(200).json({results : results});
  })
})

app.get('/getpartyhall', async(req,res)=>{
  const q = 'SELECT * FROM PartyHall';
  con.query(q,(err,results) =>{
    if(err)
      res.status(500).json({error : err});

    res.status(200).json({results : results});

  });
});

app.get('/getFitnessBookings',async (req,res)=>{
  const q = 'SELECT ServiceName FROM GymServices WHERE ServiceID IN (SELECT ItemID FROM GymOrderItems)';
  con.query(q,async (err,results)=>{
    if(err)
      res.status(500).json({error : err})

    res.status(200).json({results : results});
  })
})

app.get('/headcook',async (req,res)=>{
  const q = 'SELECT fi.*, oi.Quantity, o.CustomerID FROM FoodItems fi JOIN OrderItems oi ON fi.ItemID = oi.ItemID JOIN Orders o ON oi.OrderID = o.OrderID WHERE o.Category = "food"'
  con.query(q,async (err,results)=>{
    if(err)
      res.status(500).json({error : err})

    res.status(200).json({results : results});
  })
})

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
