var budgetCtrl = (function budgetController() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.getPercent = function getExpensePercentage() {
    return this.percentage;
  };

  Expense.prototype.calcPercent = function calculateIndividualExpensePercantage(totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    }
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

  var calcTotalPercent = function calculatePercentageOfTotalSpent() {
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
    
    delItem: function(type, id) {
      var ids;
      var index;

      ids = data.items[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.items[type].splice(index, 1);
      }
    },

    getPercentages: function() {
      var allPercents = data.items.exp.map(function(current) {
        return current.getPercent();
      });
      return allPercents;
    },

    calculatePercentages: function() {
      data.items.exp.forEach(function(current) {
        current.calcPercent(data.total.inc);
      });
    },

    calcBudget: function() {
      calcTotal('inc');
      calcTotal('exp');
      calcCurrBudget();
      calcTotalPercent();
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
    percentageLabel: '.js-budget__expenses--percentage',
    container: '.js-container',
    expensesPercLabel: '.js-item__percentage',
    dateLabel: '.js-month'
  };

  formatNum =  function formatNumber(numIn, type){
    var num = numIn;
    var numSplit;
    var int;
    var dec;
    var sign;

    num = Math.abs(numIn);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if (int.lenght > 3) {
      int = int.substr(0, int.lenght - 3) + '.' + int.substr(int.lenght - 3, 3);
    }

    if (type === 'exp') {
      sign = '-';
    } else {
      sign = '+';
    }

    return `${sign} R$ ${int},${dec}`;  
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getDOMstrings: function() {
      return DOMstrings;
    },

    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    clearFields: function() {
      var fields, fieldsArray;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(current) { current.value = ''; });
      fieldsArray[0].focus(); 
    },

    addListItem: function(item, type) {
      var html, newHtml, element;

      if (type === 'inc') {       
        DOMelement = DOMstrings.incomesContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {  
        DOMelement = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage js-item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace('%id%', item.id);
      newHtml = newHtml.replace('%description%', item.description);
      newHtml = newHtml.replace('%value%', formatNum(item.value, type));
      
      document.querySelector(DOMelement).insertAdjacentHTML('beforeend', newHtml);
    },

    delListItem: function(selectorId) {
      var element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },

    displayBudget: function(DOMobj) {
      var type;
      if (DOMobj.budget > 0) {
        type = 'inc';
      } else {
        type = 'exp';
      }       

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(DOMobj.budget, type);
      document.querySelector(DOMstrings.incomesLabel).textContent = formatNum(DOMobj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNum(DOMobj.totalExp, 'exp');
      if(DOMobj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = DOMobj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
      
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = `${percentages[index]} %`;
        } else {
          current.textContent = '---';
        }              
      });
    },

    changeType: function() {
      var fields;

      fields = document.querySelectorAll(
        `${DOMstrings.inputType},
        ${DOMstrings.inputDescription},
        ${DOMstrings.inputValue}`
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
      });
    },

    displayMonth: function() {
      var now;
      var month;
      var year;

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' de ' + year;

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

    document.querySelector(DOMobj.container).addEventListener('click', ctrlDelItem);
    document.querySelector(DOMobj.inputType).addEventListener('change', UICtrl.changeType);

  };
  
  var ctrlAddItem = function addItemToDataAndUI() {
    var input;
    var newItem;
    
    input = UICtrl.getInput();

    if (!isNaN(input.value)) {
      if (input.description === '') input.description = 'No description';        
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      if (input.type === 'exp') {
        updatePercentages();
      }
    }
  };

  var ctrlDelItem = function deleteItemFromDataAndUI(event) {
    var selectorID;
    var itemObject;
    var type;
    var id;
    
    // Get the item, which is parent of the button, rather than the button itself
    selectorId = event.target.parentNode.parentNode.parentNode.id;

    if (selectorId) {
      itemObject = selectorId.split('-');
      type = itemObject[0];
      id = parseInt(itemObject[1]);
    }

    budgetCtrl.delItem(type, id);
    UICtrl.delListItem(selectorId);
    updateBudget();
    updatePercentages();
  };

  var updateBudget = function updateTheGlobalBudgetValue() {
    budgetCtrl.calcBudget();

    var budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };  

  var updatePercentages = function() {
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);
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
      UICtrl.displayMonth();
    }    
  };  

}(budgetCtrl, UICtrl));

mainCtrl.init();
