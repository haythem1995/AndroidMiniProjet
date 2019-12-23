/*
RESTFUL Services by NodeJS
Author: Yafet Shil
*/
var crypto = require('crypto');
var uuid = require ('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer, storage, path, crypto;
multer = require('multer')
path = require('path');
var form = "<!DOCTYPE HTML><html><body>" +
    "<form method='post' action='/upload' enctype='multipart/form-data'>" +
    "<input type='file' name='upload'/>" +
    "<input type='submit' /></form>" +
    "</body></html>";
//cmnt
//Connect to MySQL
var con = mysql.createConnection({
    host:'127.0.0.1',
    port: '8889',
    user: 'root',
    password: 'root',
    connector: 'mysql',
    database: 'miniprojet',
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

//Connect to MySQL
/*var con = mysql.createConnection({
    host:'127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    connector: 'mysql',
    database: 'miniprojet',
});*/



con.connect((err)=> {
    if(!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

//PASSWORD CRYPT
var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') //Convert to hexa format
        .slice(0,length);
    
};
var sha512 = function (password,salt) {
    var hash = crypto.createHmac('sha512',salt) ; //Use SHA512
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
    
};
/* Hash password */
function saltHashPassword(userPassword) {
    var salt = genRandomString(16); //Gen Random string with 16 charachters
    var passwordData = sha512(userPassword,salt) ;
    return passwordData;
    
}
function checkHashPassword(userPassword,salt) {
    var passwordData = sha512(userPassword,salt);
    return passwordData;
    
}

var app = express();
app.use(bodyParser.json()); // Accept JSON params
app.use(bodyParser.urlencoded({extended:true})); //Accept UrlEncoded params

app.get('/', function (req, res){
    res.writeHead(200, {'Content-Type': 'text/html' });
    res.end(form);

});

var fs = require('fs');

storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        return crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) {
                return cb(err);
            }
            return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
        });
    }
});

// Post files
app.post(
    "/upload",
    multer({
        storage: storage
    }).single('upload'), function(req, res) {
        console.log(req.file);
        console.log(req.body);
        res.redirect("/uploads/" + req.file.filename);
        console.log(req.file.filename);
        return res.status(200).end();
    });

app.get('/uploads/:upload', function (req, res){
    file = req.params.upload;
    console.log(req.params.upload);
    var img = fs.readFileSync(__dirname + "/uploads/" + file);
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');

});

/* REGISTER */
app.post('/register/',(req,res,next)=>{
    var post_data = req.body;  //Get POST params
    var uid = uuid.v4();   //Get  UUID V4
    var plaint_password = post_data.password ;  //Get password from post params
    var hash_data = saltHashPassword(plaint_password);
    var password = hash_data.passwordHash;  //Get Hash value
    var salt = hash_data.salt; //Get salt

    var name = post_data.name;
    var email = post_data.email;
    var prenom = post_data.prenom;
    var tel_user = post_data.tel_user;
    var image_user = post_data.image_user;

    con.query('SELECT * FROM user where email=?',[email],function (err,result,fields) {

        if (result && result.length)
            res.json('Cette adresse mail est déjà utilisé');
        else {
            con.query('INSERT INTO `user`(`unique_id`, `name`, `email`, `encrypted_password`, `salt`, `created_at`, `updated_at`, `prenom`, `tel_user`, `image_user`) ' +
                'VALUES (?,?,?,?,?,NOW(),NOW(),?,?,?)',[uid,name,email,password,salt,prenom,tel_user,image_user],function (err,result,fields) {
               if (err) throw err;

                res.json('Vous ètes inscrit avec succés');

            })
        }
    });

})

/* LOGIN */

app.post('/login/',(req,res,next)=>{
    var post_data = req.body;

    //Extract email and password from request
    var user_password = post_data.password;
    var email = post_data.email;

    con.query('SELECT * FROM user where email=?',[email],function (err,result,fields) {
        if (result && result.length)
            {
                var salt = result[0].salt;
                var encrypted_password = result[0].encrypted_password;
                var hashed_password = checkHashPassword(user_password, salt).passwordHash;
                if (encrypted_password == hashed_password)
                    res.send({ user:result });
                else
                    res.end(JSON.stringify('Vérifiez votre mot de passe'));
            }
        else {

                res.json('Utilisateur introuvable');

         }

    });


})
/* UPDATE PROFILE */
app.put('/user/edit/:id', (req, res) => {

    const id = req.params.id;
    con.query('UPDATE user SET ? WHERE id = ?', [req.body, id], (error, result) => {
        if (error) throw error;

        res.send('Porifle modifié avec succés');
    });
});

/* SHOW PROFILE DETAILS */
app.get('/user/show/:id', (req, res) => {
    var post_data = req.body;  //Get POST params

    const id = req.params.id;


    con.query('SELECT * FROM `user` WHERE id =?' ,[id],  (error, result) => {
        if (error) throw error;

        res.send(result);
        console.log(result);
    });

});



/* SHOW EVENT */
app.get('/evenement/show', (req, res) => {

    con.query('SELECT * FROM evenement',((err, results, fields) => {
        if(!err){
            res.send({ evenements:results });
        }
        else {
            console.log(err)

        }
    }))

});

/* ADD EVENT */
app.post('/evenement/add',(req,res,next)=>{
    var post_data = req.body;  //Get POST params
    var nom_evenement = post_data.nom_evenement;
    var type_evenement = post_data.type_evenement;
    var date_debut_evenement = post_data.date_debut_evenement;
    var date_fin_evenement = post_data.date_fin_evenement;
    var distance_evenement = post_data.distance_evenement;
    var photo_evenement = post_data.photo_evenement;
    var lieux_evenement = post_data.lieux_evenement;
    var infoline = post_data.infoline;
    var difficulte_evenement = post_data.difficulte_evenement;
    var prix_evenement = post_data.prix_evenement;
    var nbr_place = post_data.nbr_place;
    var description_evenement = post_data.description_evenement;
    var id_user = post_data.id_user;






    con.query('INSERT INTO `evenement`(`nom_evenement`, `type_evenement`, `date_debut_evenement`, `date_fin_evenement`, `distance_evenement`, `photo_evenement`, `lieux_evenement`,`infoline`,`difficulte_evenement`,`prix_evenement`,`nbr_place`,`description_evenement`,`id_user`) ' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[nom_evenement,type_evenement,date_debut_evenement,date_fin_evenement,distance_evenement,photo_evenement,lieux_evenement,infoline,difficulte_evenement,prix_evenement,nbr_place,description_evenement,id_user],function (err,result,fields) {
                if (err) throw err;

                res.json('Evenement ajouté avec succés');

            });

    })

/* SHOW EVENT DETAILS */
app.get('/evenement/show/:id', (req, res) => {
    var post_data = req.body;  //Get POST params

    const id = req.params.id;


    con.query('SELECT * FROM `evenement` WHERE id_evenement =?' ,[id],  (error, result) => {
       // if (error) throw error;

        if(!error){
            res.send({ evenement:result });
        }
        else {
            console.log(error)

        }
    });

});


/* DELETE EVENT*/

app.delete('/evenement/delete/:id',(req, res) => {
    const id = req.params.id;
    let sql = 'DELETE from evenement where id_evenement =?';
    let query = con.query(sql,[id],(err, result) => {
        if(err) throw err;
        res.send('Evènement supprimé avec succés');
    });
});

/* UPDATE EVENT */
app.put('/evenement/edit/:id', (req, res) => {

    const id = req.params.id;
    con.query('UPDATE evenement SET ? WHERE id_evenement = ?', [req.body, id], (error, result) => {
        if (error) throw error;

        res.send('Evenement modifié avec succés');
    });
});

/* ADD ARTICLE */
app.post('/article/add',(req,res,next)=>{
    var post_data = req.body;  //Get POST params
    var titre_article = post_data.titre_article;
    var description_article = post_data.description_article;
    var location_article = post_data.location_article;
   // var date_article = post_data.date_article;
    var categorie_article = post_data.categorie_article;
    var prix_article = post_data.prix_article;
    var image_article = post_data.image_article;
    var user_id = post_data.user_id;

let currentDate = Date.now();
    let date_ob = new Date(currentDate);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let dateFinal = year + "-" + month + "-" + date;






    con.query('INSERT INTO `article`( `titre_article`, `description_article`, `location_article`, `date_article`, `categorie_article`, `prix_article`,`image_article`,`user_id`) ' +
        'VALUES (?,?,?,?,?,?,?,?)',[titre_article,description_article,location_article,dateFinal,categorie_article,prix_article,image_article,user_id],function (err,result,fields) {
        if (err) throw err;

        res.json('Article ajouté avec succés');

    });

});
/* ADD PARTICIPANT */
app.post('/participant/add',(req,res,next)=>{
    var post_data = req.body;  //Get POST params

    var id_user = post_data.id_user;
    var id_evenement = post_data.id_evenement;
    con.query('SELECT * FROM participants where id_user=? and id_evenement=?',[id_user,id_evenement],function (err,result,fields) {

        if (result && result.length)
            res.json('participated already');
        else {
            con.query('INSERT INTO `participants`(`id_user`, `id_evenement`)' +
                'VALUES (?,?)', [id_user, id_evenement], function (err, result, fields) {
                if (err) throw err;

                res.json('Participant ajouté avec succés');

            });

        }

});
});

/* CANCEL PARTICIPATION */
app.delete('/participant/delete',(req,res,next)=>{
    var post_data = req.body;  //Get POST params

    var id_user = post_data.id_user;
    var id_evenement = post_data.id_evenement;
        con.query('DELETE FROM `participants` WHERE id_user=? and id_evenement=?', [id_user, id_evenement], function (err, result, fields) {
                if (err) throw err;

                res.json('participation annulé avec succés');

            });



    });



/* Increment nbr place*/
app.put('/annuler/:id', (req, res) => {
    const id = req.params.id;
    con.query(
        'UPDATE evenement SET nbr_place = nbr_place + 1 WHERE id_evenement = ? ',
        [id],
        function (err,result,fields) {
            if (err) throw err;

                res.json('incremented successfully');

        }
    );
});
/* Decrement nbr place*/
app.put('/participate/:id', (req, res) => {
    const id = req.params.id;
    con.query(
        'UPDATE evenement SET nbr_place = nbr_place - 1 WHERE id_evenement = ? and nbr_place > 0',
        [id],
        function (err,result,fields) {
            if (err) throw err;
            if (result.affectedRows > 0) {
                res.json('decremented successfully');
            } else {
                res.json('no more places');
            }
        }
    );
});


/* SHOW MY EVENTS */
app.get('/myevents/:id', (req, res) => {
    const id = req.params.id;


    con.query('SELECT * FROM evenement WHERE id_user = ?',[id],((err, results, fields) => {
        if(!err){
            res.send({ evenements:results });
        }
        else {
            console.log(err)

        }
    }))

});

/* SHOW MY EVENTS */
app.get('/myarticles/:id', (req, res) => {
    const id = req.params.id;


    con.query('SELECT * FROM article WHERE id_user = ?',[id],((err, results, fields) => {
        if(!err){
            res.send({ articles:results });
        }
        else {
            console.log(err)

        }
    }))

});

//Start Server
app.listen(1337,()=>{
    console.log('Restful Running on port 1337');
})