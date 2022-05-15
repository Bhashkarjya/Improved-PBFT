class ProductList{
    constructor()
    {
        this.productDatabase = new Map();
    }

    addProduct(key,data)
    {
        this.productDatabase.set(key,data);
    }
}

module.exports = ProductList;