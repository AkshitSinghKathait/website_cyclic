import express from "express";
import bodyParser from "body-parser" ;
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg" ;
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';


// CONNECTING DATABASE
const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new pg.Client({
  user: "postgres" ,
  database: "railway" ,
  password: "*B1AcCDbDegA4DD5DfB*C-fG5a6-c1e6" ,
  host : "roundhouse.proxy.rlwy.net" ,
  port: 55650
}) ;


  // Convert exec to a promise-based function
const execPromise = promisify(exec);


db.connect() ;

// RUNNING SERVER AND FORM

const app = express();
const port = 3000 ; 


app. listen(process.env.PORT || port, ( ) =>
{ console.log(` Server running on port ${port}.`) ;
})

app.use(express.urlencoded({ extended: true }));


// HOMEPAGE

app.get("/", (req, res) => {
  res.render(__dirname + "/views/index.ejs");
  });

// DATAENTRY FORM
app.get("/enter_data" , (req, res) => {
   res.render(__dirname + "/views/enter_data.ejs");
  });


  // Entering  customer get stockcode page . 
  app.post("/get_for_customer", (req, res) => {
    const CustomerID = req.body.CustomerID;  
    const sqlQuery = 'SELECT "stockcode", "bestsale2nd", "bestsale3rd" FROM "customerrecostock" WHERE "customerid" = $1';
    db.query(sqlQuery, [CustomerID], (err, result) => {
      if (err) {
        let ret_satus = " Can not retrieve from data base"     // Handle errors as needed
      } else {
        // Rows will contain the result of the query
        let ret_status = " Recommended stocks retrieved succesfully . "
        console.log("awesome")
        const rows = result.rows;
        console.log(rows.length)
        if (rows.length === 0 ){
          let ret_status = " No such user found ."
          res.render(__dirname + "/views/show_result.ejs" , 
         {
             stock_b : " No such user found . No stock to recommend" ,
             database : " " ,
             retrieve : ret_status ,
             stock_a : "" ,
             
             stock_c : ""
   
         })
         }
         else{ 
   
   
         //let stock1 = rows[0].stockcode
         //let stock2 = rows[0].bestsale2nd
         //let stock3 = rows[0].bestsale3rd 
         
         
         res.render("show_result.ejs" , 
         {
             stock_b : rows[0].bestsale2nd ,
             database : " " ,
             retrieve : ret_status ,
             stock_a : rows[0].stockcode ,
             
             stock_c : rows[0].bestsale3rd 
   
         })
       }}
     }            
     
   );   
  })



  // Get customer id from stock page
  app.post("/get_for_stockcode", (req, res) => { 
    const StockCode = req.body.StockCode;
    const sqlQuery = 'SELECT "customerid" FROM "customerrecostock" WHERE "stockcode" = $1 or "bestsale2nd" = $1 or "bestsale3rd" = $1 '
    db.query(sqlQuery, [StockCode], (err, result) => {
      if (err) {
        let ret_satus = " Can not retrieve from data base"     // Handle errors as needed
      } else {
        // Rows will contain the result of the query
        let ret_status = " list of customer retrieved succesfully . "
        console.log("awesome")
        const rows = result.rows;
        console.log(result) ;
        console.log(rows) ; 
        res.render(__dirname + "/views/dis_cust.ejs" , { dataArray: rows })

      }})})



// DATA INSERTION FORM AND EXECUTION
// DATA INSERTION FORM AND EXECUTION
app.post("/submit", (req, res) => {
  console.log(req.body);
  const InvoiceNo = req.body.InvoiceNo;
  const StockCode = req.body.StockCode;
  const Description = req.body.Description;
  const Quantity = req.body.Quantity;
  const InvoiceDate = req.body.InvoiceDate;
  const UnitPrice = req.body.UnitPrice;
  const CustomerID = req.body.CustomerID;
  const Country = req.body.Country;
  let data_stat = "Data inserted succesfully"

  db.query(
    'INSERT INTO customer_sale("InvoiceNo" ,"StockCode", "Description", "Quantity", "InvoiceDate", "UnitPrice", "CustomerID", "Country") VALUES( $1 , $2, $3, $4, $5, $6, $7, $8)',
    [InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country],
    (err, result) => {
      if (err) {
        let data_stat = err
      } else {
        
      }
    }
  );
  
  // DISPLAYING THE OUTPUT FOR THE DATA INSERT 
  // Your SQL query to select rows based on a condition
  const sqlQuery = 'SELECT "stockcode", "bestsale2nd", "bestsale3rd" FROM "customerrecostock" WHERE "customerid" = $1';
  db.query(sqlQuery, [CustomerID], (err, result) => {
    if (err) {
      let ret_satus = " Can not retrieve from data base"     // Handle errors as needed
    } else {
      // Rows will contain the result of the query
      let ret_status = " Recommended stocks retrieved succesfully . "
      console.log("awesome")
      const rows = result.rows;
      console.log(rows.length)
      

      if (rows.length === 0 ){
       let ret_status = " New user . Can not recommend as no past history ."
       res.render(__dirname + "/views/shw_result_new.ejs" , 
      {
          stock_b1 : " New user . No stock to recommend" ,
          database : data_stat ,
          retrieve : ret_status ,
          stock_a1 : "" ,
          
          stock_c1 : ""

      })
      } 
     else{
        res.render(__dirname + "/views/show_result.ejs" , 
      {
          stock_b : rows[0].bestsale2nd ,
          database : data_stat ,
          retrieve : ret_status ,
          stock_a : rows[0].stockcode ,
          
          stock_c : rows[0].bestsale3rd 

      })}
    }
  }            
  
);
        
}); // <-- Corrected closing parenthesis


// TRAINING Data selectin
app.get("/Get_data" , (req, res) => {
  res.render(__dirname + "/views/Get_data.ejs");
 });

   
// TRAINING PATH SELECTION
app.get("/train" , (req, res) => {
  res.render(__dirname + "/views/train_model_form.ejs");
 });

