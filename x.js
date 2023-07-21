import { Translate } from './languages/translation.js';

var language;
function setLanguage(lang) {
    localStorage.setItem('language', lang);
}

function load(lang) {
    var translate = new Translate();
    var currentLng = lang;//'fr'
    var attributeName = 'data-tag';
    translate.init(attributeName, currentLng);
    translate.process();
}
load("pt")

document.querySelectorAll('.dropdown-itemLanguage').forEach(function (item) {
    item.addEventListener('click', async function () {
        document.querySelectorAll('.dropdown-itemLanguage').forEach(function (item) {
            item.classList.remove('active');
        });
        this.classList.add('active');
        var x = this.getAttribute('value');
        console.log(x);
        setLanguage(x);  
        load(x);  
    });
});