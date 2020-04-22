'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {
    save: (req, res) => {
        // get Post params
        var params = req.body;

        // Validate data
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        }catch(err){
            return res.status(500).send({
                status: 'error',
                message: 'Not enough input'
            });
        }

        if(validate_title && validate_content){
            
            //Create object
            var article = new Article();

            article.title = params.title;
            article.content = params.content;

            if(params.image){
                article.image = params.image;
            }else{
                article.image = null;
            }
           
            //Save article
            article.save((err, articleStored) => {

                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'Article not saved'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });

            });

        }else{
            return res.status(500).send({
                status: 'error',
                message: 'Data not valid!'
            });
        }
       
    },

    getArticles: (req, res) => {
        var query = Article.find({});

        var last = req.params.last;
		
        if(last || last != undefined){
            query.limit(5);
        }

        // Find query
        query.sort('-_id').exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Not able to return articles'
                });
            }

            if(!articles){
                return res.status(404).send({
                    status: 'error',
                    message: 'No articles in DB'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        });
    },

    getArticle: (req, res) => {
        var articleId = req.params.id;

        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'error',
                message: 'Article does not exist'
            });
        }

        Article.findById(articleId, (err, article) => {
            
            if(err || !article){
                return res.status(404).send({
                    status: 'error',
                    message: 'Article does not exist'
                });
            }

            return res.status(200).send({
                status: 'success',
                article
            });

        });
    },

    update: (req, res) => {
        var articleId = req.params.id;

        var params = req.body;

        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Params not enough'
            }); 
        }

        if(validate_title && validate_content){
             // Find and update
             Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error updating data'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'Article does not exist'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
             });
        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Not validated'
            });
        }
       
    },

    delete: (req, res) => {
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Not able to delete article'
                });
            }

            if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'Article does not exist'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });

        }); 
    },

    upload: (req, res) => {
        var file_name = 'Image not uploaded...';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // FOR LINUX OR MAC:
        // var file_split = file_path.split('/');

        var file_name = file_split[2];

        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión de la imagen no es válida !!!'
                });
            });
        }else{
             var articleId = req.params.id;

             if(articleId){
                Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new:true}, (err, articleUpdated) => {

                    if(err || !articleUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Cannot save image'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
             }else{
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
             }
            
        }   
    },

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'Image does not exist'
                });
            }
        });
    },

    search: (req, res) => {
        var searchString = req.params.search;

        // Find or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Request failed'
                });
            }
            
            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'There are no articles that match your search'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    }

}; // end controller

module.exports = controller;