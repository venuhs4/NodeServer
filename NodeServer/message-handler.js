module.exports = {
    processMessage : function (obj) {
        console.log(obj);
        obj.data = obj.data.toUpperCase();
        return obj;
    }
};

