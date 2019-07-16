jQuery.fn.visible = function (b) {
    if (b === undefined)
        return this.css('display') == "none";
    else {
        this.css('display', b ? '' : 'none');
        return this;
    }
}