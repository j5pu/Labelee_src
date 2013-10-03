/**
 * Created with PyCharm.
 * User: Álvaro
 * Date: 2/10/13
 * Time: 14:57
 * To change this template use File | Settings | File Templates.
 */
var AnalyticsManager =
{
    categoryKeys: [],
    currentCategory: null,
    baseUrl: '/dashboard/',
    clickOnCategory: function (span) {
        var category = span.children[0].id;
        if (this.currentCategory != category) {
            this.currentCategory = category;
            var idCategory = this.currentCategory.split('_')[1];

            if (idCategory) {
                this._saveClickCategory(idCategory);
            }
        } else {
            this.currentCategory = null;

        }
    },
    addCategoryKey: function (key) {
        this.categoryKeys.push(key);

    },
    init: function () {

        for (var categoryIndex in this.categoryKeys) {
            if (document.getElementById(this.categoryKeys[categoryIndex])) {
                document.getElementById(this.categoryKeys[categoryIndex]).parentNode.onclick = function () {
                    AnalyticsManager.clickOnCategory(this);

                };
            }

        }

    },
    _saveClickCategory: function (idcategory) {
         var user = "anonymous"
        if (localStorage.getItem("first_shoot")) {
             user = JSON.parse(localStorage.getItem("first_shoot"))["key"];
        }

         var data = {idcategory: idcategory, user: user };
        $.ajax({
            url: this.baseUrl + 'Services/SaveClickOnCategory',
            type: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            dataType: 'json', // esto indica que la respuesta vendrá en formato json
            async: true,
            success: function (response) {


            },
            error: function (response) {
                alert('error');
                console.log(response);
            }

        });
    }

}