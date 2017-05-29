angular.module('app', ['flowchart', 'ui.tree', 'ui.bootstrap'])
  .factory('prompt', function () {
    return prompt;
  })
  .config(function (NodeTemplatePathProvider) {
    NodeTemplatePathProvider.setTemplatePath("flowchart/node.html");
  })

  .controller('AppCtrl', function AppCtrl($scope, prompt, Modelfactory, flowchartConstants, $http, $uibModal, $log, $rootScope) {

    var deleteKeyCode = 46;
    var ctrlKeyCode = 17;
    var aKeyCode = 65;
    var escKeyCode = 27;
    var nextNodeID = 10;
    var nextConnectorID = 1;
    var ctrlDown = false;


    $rootScope.model =  {
      nodes: [
        {
          name: "FirstName",
          id: 2,
          x: 30,
          y: 0,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.bottomConnectorType,
              id: 10
            }
          ]
        },
        {
          name: "LastName",
          id: 3,
          x: 30,
          y: 50,
          color: '#F15B26',
          connectors: [
            {
              type: flowchartConstants.bottomConnectorType,
              id: 2
            }
          ]
        },
        {
          name: "AccountType",
          id: 4,
          x: 30,
          y: 100,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.bottomConnectorType,
              id: 14
            }
          ]
        },
        {
          name: "Cust_AccountID",
          id: 5,
          x: 30,
          y: 150,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.bottomConnectorType,
              id: 17
            }
          ]
        },
        {
          name: "Cust_Account_SortCode",
          id: 105,
          x: 30,
          y: 200,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.bottomConnectorType,
              id: 117
            }
          ]
        },
        {
          name: "AccountType",
          id: 6,
          x: 1300,
          y: 0,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 18
            }
          ]
        },
        {
          name: "customer",
          id: 7,
          x: 1300,
          y: 50,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 19
            }
          ]
        },
        {
          name: "AccountID",
          id: 8,
          x: 1300,
          y: 100,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 20
            }
          ]
        },
        {
          name: "Cust_Balance",
          id: 9,
          x: 1300,
          y: 150,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 21
            }
          ]
        },
        {
          name: "StartDate",
          id: 10,
          x: 1300,
          y: 200,
          color: '#000',
          borderColor: '#000',
          connectors: [
            {
              type: flowchartConstants.topConnectorType,
              id: 22
            }
          ]
        }
      ],
    edges: []
  };

    $scope.flowchartselected = [];
    //var modelservice = 

    // $rootScope.model = model;
    $rootScope.modelservice = Modelfactory($rootScope.model, $scope.flowchartselected);;



    $scope.addNewNode = function (nodeName) {
      var newNode = {
        name: nodeName.name,
        id: nextNodeID++,
        x: Math.floor(Math.random() * 500) + 1,
        y: Math.floor(Math.random() * 300) + 1,
        color: '#F15B26',
        editable: false,
        properties: nodeName.properties,
        connectors: []
      };

      nodeName.input_terminals.forEach(function (element) {
        newNode.connectors.push({ id: nextConnectorID++, type: flowchartConstants.topConnectorType, });
      }, this);

      nodeName.output_terminals.forEach(function (element) {
        newNode.connectors.push({ id: nextConnectorID++, type: flowchartConstants.bottomConnectorType, });
      }, this);

      $rootScope.model.nodes.push(newNode);

    };






    $scope.activateWorkflow = function () {
      angular.forEach($rootScope.model.edges, function (edge) {
        edge.active = !edge.active;
      });
    };

    $scope.addNewInputConnector = function () {
      var connectorName = prompt("Enter a connector name:", "New connector");
      if (!connectorName) {
        return;
      }

      var selectedNodes = $rootScope.modelservice.nodes.getSelectedNodes($rootScope.model);
      for (var i = 0; i < selectedNodes.length; ++i) {
        var node = selectedNodes[i];
        node.connectors.push({ id: nextConnectorID++, type: flowchartConstants.topConnectorType, });
      }
    };

    $scope.addNewOutputConnector = function () {
      var connectorName = prompt("Enter a connector name:", "New connector");
      if (!connectorName) {
        return;
      }

      var selectedNodes = $rootScope.modelservice.nodes.getSelectedNodes($rootScope.model);
      for (var i = 0; i < selectedNodes.length; ++i) {
        var node = selectedNodes[i];
        node.connectors.push({ id: nextConnectorID++, type: flowchartConstants.bottomConnectorType });
      }
    };

    $scope.deleteSelected = function () {
      $rootScope.modelservice.deleteSelected();
    };


    $scope.callbacks = {
      edgeDoubleClick: function () {
        console.log('Edge double clicked.');
      },
      edgeMouseOver: function () {
        console.log('mouserover')
      },
      isValidEdge: function (source, destination) {
        return source.type === flowchartConstants.bottomConnectorType && destination.type === flowchartConstants.topConnectorType;
      },
      edgeAdded: function (edge) {
        console.log("edge added");
        console.log(edge);
      },
      nodeRemoved: function (node) {
        console.log("node removed");
        console.log(node);
      },
      edgeRemoved: function (edge) {
        console.log("edge removed");
        console.log(edge);
      },

      nodeCallbacks: {
        'doubleClick': function (event) {
          console.log('Node was doubleclicked.')
          // prompt("Change the name of node")
        },
        'click': function (selected) {
          console.log('Node was clicked.');
          $rootScope.selectedNode = selected;
          var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
          });
          console.log($rootScope.selectedNode);
        }
      }
    };
    
    $rootScope.modelservice.registerCallbacks($scope.callbacks.edgeAdded, $scope.callbacks.nodeRemoved, $scope.callbacks.edgeRemoved);

  })

  .controller('ModalInstanceCtrl', function ($uibModalInstance, $scope) {
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
