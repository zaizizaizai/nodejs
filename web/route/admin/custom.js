const express=require('express');
const common=require('../../libs/common.js');
const mysql=require('mysql');
const pathLib=require('path');
const fs=require('fs');

//连接数据库
var db=mysql.createPool({host:'localhost',user:'root',password:'mysql',database:'learner'});

module.exports=function(){
    var router=express.Router();

    //用户评价页面
    router.get('/',function(req,res){
        switch(req.query.act){
            //删除数据库数据和上传的图片
            case 'del' :
                db.query(`SELECT * FROM custom_evaluation_table WHERE ID=${req.query.id}`,(err,data)=>{
                    if(err){
                        console.log(err);
                        req.status(500).send('database error').end();
                    }else if(data.length==0){
                            res.status(404).send('no this custom evaluation').end();
                    }else{
                        fs.unlink('static/upload/'+data[0].src,(err,data)=>{
                            if(err){
                                console.error(err);
                                req.status(500).send('file opration error').end();
                            }else{
                                db.query(`DELETE FROM custom_evaluation_table WHERE ID=${req.query.id}`,(err,data)=>{
                                    if(err){
                                        console.log(err);
                                        req.status(500).send('database error').end();
                                    }else{
                                        res.redirect('/admin/custom');
                                    }
                                });
                            }
                        });
                    }
                });
                break;
            //修改
            case 'mod':
                db.query(`SELECT * FROM custom_evaluation_table WHERE ID=${req.query.id}`,(err,data)=>{
                    if(err){
                        console.error(err);
                        res.status(500).send('database error').end();
                    }else if(data.length==0){
                        res.status(404).send('no this evaluation').end();
                    }else{
                        
                    }
                });
                break;
            default:
                //渲染页面
                db.query(`SELECT * FROM custom_evaluation_table`,(err,evaluations)=>{
                    if(err){
                        console.log(err);
                        req.status(500).send('database error').end();
                    }else{
                        res.render('admin/custom.ejs',{evaluations});
                    }
                });
                break;
        } 
    });
    //处理数据
    router.post('/',function(req,res){
        //取出请求的参数
        var title=req.body.title;
        var description=req.body.description;

        var ext=pathLib.parse(req.files[0].originalname).ext;
        var oldpath=req.files[0].path;
        var newpath=req.files[0].path+ext;

        var newFileName=req.files[0].filename+ext;

        fs.rename(oldpath,newpath,(err)=>{
            if(err){
                res.status(500).send('file opration error').end();
            }else{
                if(req.body.mod_id){    //修改
                    
        
                }else{  //添加
                    db.query(`INSERT INTO custom_evaluation_table \
                    (title,description,src)
                    VALUES('${title}','${description}','${newFileName}')`,
                (err,data)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send('database error').end();
                    }else{
                        //重定向
                        res.redirect('/admin/custom');
                    }
                });
                }
            }
        });  
    });
    return router;
};