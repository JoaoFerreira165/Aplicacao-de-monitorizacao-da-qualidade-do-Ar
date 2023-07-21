function Translate() {
    //initialization
    this.init = function (attribute, lng) {
        this.attribute = attribute;
        this.lng = lng;
    }
    //translate 
    this.process = function () {
        let _self = this;
        var xrhFile = new XMLHttpRequest();
        xrhFile.open("GET", "/meteo/languages/" + this.lng + ".json", false);
        xrhFile.onreadystatechange = function () {
            if (xrhFile.readyState === 4) {
                if (xrhFile.status === 200 || xrhFile.status == 0) {
                    var LngObject = JSON.parse(xrhFile.responseText);
                    var allDom = document.getElementsByTagName("*");
                    for (var i = 0; i < allDom.length; i++) {
                        var elem = allDom[i];
                        var key = elem.getAttribute(_self.attribute);
                        if (key != null) {
                            elem.innerHTML = LngObject[key] ? LngObject[key] : elem.innerHTML;
                        }
                    }
                }
            }
        }
        xrhFile.send();
    }
}
export { Translate };