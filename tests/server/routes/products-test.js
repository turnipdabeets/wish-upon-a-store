// Instantiate all models
var expect = require('chai').expect;
var Sequelize = require('sequelize');
process.env.NODE_ENV = 'testing';
var db = require('../../../server/db', {loggging: false});
var Product = db.model('product');
var User = db.model('user');
var supertest = require('supertest');

var app = require('../../../server/app')(db);
var agent = supertest.agent(app);

describe('/products', function() {
    before(function() {
        return db.sync({ force: true });
    });

    var userInfo = {
        name: 'Mr. H',
        email: 'test@test.com',
        isAdmin: true,
        password: "myPassword"
    };

    before(function(done) {
        return User.create(userInfo).then(function (user) {
            done();
        }).catch(done);
    });

    before(function(done){
        agent.post('/login').send(userInfo).end(done);
    })

    after(function() {
        return db.sync({ force: true });
    });

    describe('GET /products', function() {
        var product;
        beforeEach(function() {
            return Product.create({
                    name: 'Product1',
                    description: 'a product',
                    price: 10.0,
                    inventoryQuantity: 2
                })
                .then(function(p) {
                    product = p;
                    return Product.create({
                        name: 'Product2',
                        description: 'another product',
                        price: 12.0,
                        inventoryQuantity: 5
                    });
                });
        });

        it('returns all of the products in the DB', function(done) {
                return agent
                .get('/api/products')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.be.instanceof(Array);
                    expect(res.body).to.have.length(2);
                    done();    
                });
        });
    });

    describe('POST /products', function() {


        it('creates a new product', function(done) {
                return agent
                .post('/api/products')
                .send({
                    name: 'Product3',
                    description: 'yay product',
                    price: 15.0,
                    inventoryQuantity: 5
                })
                .expect(201)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.name).to.equal('Product3');
                    expect(res.body.id).to.exist;
                    Product.findById(res.body.id)
                    .then(function(b) {
                        expect(b).to.not.be.null;
                        done();
                    })
                    .catch(done);
                });
        });
    });

    describe('GET /products/:id', function() {
        it('returns a product by id', function(done) {
                return agent
                .get('/api/products/1')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.name).to.equal('Product1');
                    done();
                });
        });
    });

    describe('PUT /products/:id', function() {
        it('updates a product', function(done) {
                return agent
                .put('/api/products/2')
                .send({
                    name: 'A Product'
                })
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.name).to.equal('A Product');
                    Product.findById(2)
                    .then(function(b) {
                        expect(b).to.not.be.null;
                        done();
                    })
                    .catch(done);
                });
        });
    });

    describe('DELETE /products/:id', function() {
        it('deletes a product', function(done) {
                return agent
                .delete('/api/products/2')
                .expect(204)
                .end(function (err, res) {
                    if (err) return done(err);
                    Product.findById(2)
                    .then(function (b) {
                        expect(b).to.be.null;
                        done();
                    })
                    .catch(done);
                });
        });
    });
});
