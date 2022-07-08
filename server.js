require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const User=require('./User.js')
const Exercise=require('./Exercise.js')

const mySecret = process.env['dbURI']

const app = express()


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cors())
app.use(express.static('public'))



mongoose.connect(mySecret,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then((result)=> console.log('mongoose connection success'))
    .catch((error)=> console.log('mongoose error occured'));




app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req,res)=>{
  const username= req.body.username;
  var NewUser= new User({username});
  NewUser.save((err,User)=>{
    if (err) return res.json({err:'error occured'})
    else return res.json({username:username, _id:User._id})
  })
})

app.get('/api/users',(req,res)=>{

  User.find({}).select({ __v: 0 }).exec((err, result)=>{
    if (err) return console.log("error finding user data")
    else res.send(result)
  })
    
  // User.find().select({ __v: 0 })
  //       .then((result) => {
  //           res.json(result)
  //       })
  //       .catch((err)=>{
  //           console.log('an error occured');
  //       }) 


})

app.post('/api/users/:_id/exercises', (req,res)=>{
  const _id= req.params._id;
   const DateStored= req.body.date;
   const description= req.body.description;
   const duration= req.body.duration;
  console.log(_id,DateStored,description,duration)

  if (DateStored =='' || DateStored === undefined)
          { date = new Date().toDateString()}
  else 
          { date= new Date(DateStored).toDateString()}
         

  

  User.findById(_id, (err, doc)=>{
    if(err) console.log("error finding Id")
    else {
      let NewExercise= new Exercise({ 
        username: doc.username,
        description,
        duration,
        date,
        id:_id
        });
      NewExercise.save((err,data)=>{
        if(err) return res.json({
          error: 'save failed'
        });
        else return res.json({username:NewExercise.username, description:NewExercise.description, duration:NewExercise.duration, date:NewExercise.date, _id:NewExercise.id});
      }
        
        
      )
    }
  })
})

app.get('/api/users/:_id/logs', (req,res)=>{
  const _id= req.params._id;
  
  Exercise.find({id:_id}, (err, log)=>{
    
  var array=log.map(x=>x.id.length)
    var count=array.length



    
  if (req.query.from && req.query.to) {
       log = log.filter(i => Date.parse(i.date) >  Date.parse(req.query.from)) && log.filter(i => Date.parse(i.date) < Date.parse(req.query.to));
     }

     if (req.query.limit) {
       log = log.slice(0, req.query.limit);
     }

     if (!req.query.from && !req.query.to && !req.query.limit) {
       log = log;
     }
    


    
    if (err) return console.log("error finding logs")
    else User.findById(_id, (err, doc)=>{
    if(err) console.log("error finding Id")
    else var username=doc.username
   console.log(username)
      return res.json({"username":username,"count":count,"_id":_id, log})
     })

  })
  
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})



