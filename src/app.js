var budgetCtrl = (function budgetController() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calcTotal = function calculateTotalIncomesOrExpenses(type) {
    var sum = 0;

    data.items[type].forEach(function(current) {
      sum += current.value;
    });   

    data.total[type] = sum;
  };

  var calcCurrBudget = function calculateCurrentBudget() {
    data.budget = data.total.inc - data.total.exp;
  };

  var calcPercent = function calculatePercentageOfTotalSpent() {
    if (data.total.inc > 0) {
      data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
    } else {
      data.percentage = -1;
    }    
  };

  var data = {
    items: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, desc, val) {
      var newItem;
      var id = 0;
      
      if (data.items[type].length > 0){
        id = data.items[type][data.items[type].length - 1].id + 1;
      }    

      if (type === 'exp') {
        newItem = new Expense(id, desc, val);
      } else {
        newItem = new Income(id, desc, val);
      }    
      data.items[type].push(newItem);

      return newItem;
    }, 
    
    calcBudget: function() {
      calcTotal('inc');
      calcTotal('exp');
      calcCurrBudget();
      calcPercent();
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage
      };
    },
    
    testing: function(){
      console.log(data);
    }
  };
}());

var UICtrl = (function UIController() {

  var DOMstrings = {
    inputType: '.js-add__type',
    inputDescription: '.js-add__description',
    inputValue: '.js-add__value',
    inputBtn: '.js-add__btn',
    incomesContainer: '.js-incomes__list',
    expensesContainer: '.js-expenses__list',
    budgetLabel: '.js-budget__value',
    incomesLabel: '.js-budget__incomes--value',
    expensesLabel: '.js-budget__expenses--value',
    percentageLabel: '.js-budget__expenses--percentage'

  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(item, type) {
      var html, newHtml, element;

      if (type === 'inc') {       
        DOMelement = DOMstrings.incomesContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {  
        DOMelement = DOMstrings.expensesContainer;
      html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace('%id%', item.id);
      newHtml = newHtml.replace('%description%', item.description);
      newHtml = newHtml.replace('%value%', item.value);
      
      document.querySelector(DOMelement).insertAdjacentHTML('beforeend', newHtml);
    },

    getDOMstrings: function() {
      return DOMstrings;
    },

    clearFields: function() {
      var fields, fieldsArray;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(current) {
        current.value = '';
      });
      fieldsArray[0].focus(); 
    },

    displayBudget: function(DOMobj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = 'R$' + DOMobj.budget;
      document.querySelector(DOMstrings.incomesLabel).textContent = 'R$' + DOMobj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent = 'R$' + DOMobj.totalExp;
      if(DOMobj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = DOMobj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
      
    }
  };
}());

var mainCtrl = (function generalController(budgetCtrl, UICtrl) {

  var setEvtLst = function setupEventListeners() {
    var DOMobj = UICtrl.getDOMstrings();
    document.querySelector(DOMobj.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if (event.keycode === 13 || event.which === 13) ctrlAddItem();                   
    });
  };
  
  var ctrlAddItem = function addItemToTheDataAndUI() {
    var input;
    var newItem;
    
    input = UICtrl.getInput();

      if (!isNaN(input.value)) {
        if (input.description === '') input.description = 'No description';        
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        UICtrl.addListItem(newItem, input.type);
        UICtrl.clearFields();
        updateBudget();
      }
  };

  var updateBudget = function updateTheGlobalBudgetValue() {
    budgetCtrl.calcBudget();

    var budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };  

  return {
    init: function(){
      console.log('Application has started');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setEvtLst();
    }    
  };  

}(budgetCtrl, UICtrl));

mainCtrl.init();
