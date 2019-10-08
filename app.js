//UI Controler
var UIController = (function() {

    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        totalIncomeLabel: '.budget__income--value',
        totalExpensesLabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }

        dec = numSplit[1];

        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    //The below objects and functions are made Public.
    return{
        getInput: function() {
            return{
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: document.querySelector(domStrings.inputValue).value
            };
        },

        addItemList: function(obj, type) {
            var html, newHTML, element;

            //html is edited below
            if(type === 'inc'){
                element = domStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }else if(type === 'exp'){
                element = domStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            //newHTML replaces id, description and value.
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            //We insert the html into the indes.html
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        deleteItemList: function(selectorId) {
            var el;

            el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var list;

            list = document.querySelectorAll(domStrings.inputDescription+','+domStrings.inputValue);
            //transactionType = document.querySelector(domStrings.inputType);

            Array.prototype.forEach.call(list, function(current) {
                current.value = "";
            });
        },

        updateUI: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.totalIncomeLabel).textContent = formatNumber(obj.totalInc, type);
            document.querySelector(domStrings.totalExpensesLabel).textContent = formatNumber(obj.totalExp, type);

            if(obj.percentage != -1){
                document.querySelector(domStrings.percentage).textContent = obj.percentage + '%';
            }else {
                document.querySelector(domStrings.percentage).textContent = '--';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(domStrings.expPercentageLabel);

            nodeListforEach(fields, function(curr, index) {
                //do something
                if(percentages[index] > 0){
                    curr.textContent = percentages[index] + '%';
                } else {
                    curr.textContent = '--';
                }
            });
        },

        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(domStrings.inputButton).classList.toggle('red');
            
        },

        getDOMStrings: function() {
            return domStrings;
        }
    };

})();


//DATA Controller
var DataController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur){
            sum += parseInt(cur.value);
        });

        data.totals[type] = parseInt(sum);
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: [],
            inc: []
        },
        budget: 0,
        percentage: -1
    };

    return{
        addItem: function(type, description, value) {
            var newItem, ID;

            //ID is selected below
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }

            //Object is created for income or expense
            if(type === 'exp'){
                newItem = new Expense(ID, description, value);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, description, value);
            }
            
            data.allItems[type].push(newItem);
            //created item is returned.
            return newItem;
        },

        daleteItem: function(type, id) {
            var newArr;

            newArr = data.allItems[type].map(function(curr) {
                return curr.id;
            });

            index = newArr.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate budget as : (income - total)
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }

        },

        getBudget: function() {
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage 
            };
        },

        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {

            var allPercentages = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });
            return allPercentages;
        },

        printItem: function() {
            console.log(data);
        }
        
    };

})();


//Main App Controller
var DriverControler = (function(dataCtrl, uiCtrl){

    var setupEventListeners = function() {
        var domStrings = uiCtrl.getDOMStrings();

        //1. Add Add_ITEM_EventListener
        document.querySelector(domStrings.inputButton).addEventListener('click', ctrlAddItem);

        //2. Enter Key pressed Add_ITEM_EventListener
        document.addEventListener('keydown', function(event){
            if(event.keyCode === 13){
                ctrlAddItem();
            }
        });

        //9. Add Delete Event Listener
        document.querySelector(domStrings.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(domStrings.inputType).addEventListener('change', uiCtrl.changedType);
    };

    var updateBudget = function() {

        //6. Calculate the budget
        dataCtrl.calculateBudget();

        //7. Return the Budget
        var budget = dataCtrl.getBudget();

        //8. Update the UI
        uiCtrl.updateUI(budget);
    };
    
    var updatePercentages = function() {

        //1. Calculate the percentages
        dataCtrl.calculatePercentages();

        //2. get all percentages
        var percentages = dataCtrl.getPercentages();

        //3. Update the UI
        uiCtrl.displayPercentages(percentages);

    };

    function ctrlAddItem() {
        
        // 2. Get Input Values
        var input = uiCtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

            //3. Add the new item to our data structure
            var  addNewItem = dataCtrl.addItem(input.type, input.description, input.value);

            //4. Add the new item to our UI
            uiCtrl.addItemList(addNewItem, input.type);
            uiCtrl.clearFields();

            //5. Calculate and Update the budget
            updateBudget();

            //6. Calculate and Update the Percentages
            updatePercentages();
        }
    }

    function ctrlDeleteItem(event) {
        var itemID, item, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // console.log(itemID);
        if(itemID) {
            item = itemID.split('-')
            // console.log(item);
            type = item[0];
            id = parseInt(item[1]);
        }

        //1. Delete the item from the data structure
        dataCtrl.daleteItem(type, id);

        //2. Delete the item from the UI
        uiCtrl.deleteItemList(itemID);

        //3. Update the budget
        updateBudget();

        //4. Calculate and Update the Percentages
        updatePercentages();

    }

    //Below methods are public.
    return {
        init: function(){
            uiCtrl.displayMonth();
            //console.log('Application has Started');
            uiCtrl.updateUI({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
   
})(DataController, UIController);

DriverControler.init();