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


    /// The above function creates a right panel from the json file
    $scope.CreateRightPanel = function () {
      $http.get("json/nodePallete.json")
        .then(function (response) {
          $scope.NodePallete = response.data;

        });
    };

    /// The above function creates a right panel from the json file
    $scope.saveNodes = function () {
      $http.post("https://pn-connectnode.mybluemix.net/api/connectNodeModels/replaceOrCreate", $rootScope.model)
        .then(function (response) {
          console.log(response.data.id);
          alert("Saved Successfully: " + response.data.id);
          $scope.savedId = response.data.id;
        });
    };

    $scope.updateNodes = function () {
      $http.post("https://pn-connectnode.mybluemix.net/api/connectNodeModels/" + $scope.savedId + "/replace", $rootScope.model)
        .then(function (response) {
          console.log(response);
          alert("Updated Successfully: " + response.data.id);
          $scope.savedId = response.data.id;
        });
    };

    // $scope.getNodes = function() {
    //   $http.get("https://pn-connectnode.mybluemix.net/api/connectNodeModels/6934cfbbea1180bf6ccee51727d7de32")
    //   .then(function(response) {
    //     console.log(response);
    //     delete response.data.id;
    //     $rootScope.model = response.data;
    //   });
    // };

    //$scope.getNodes();

    $scope.CreateRightPanel();

    $rootScope.model = {
      nodes: [],
      edges: [],
      projectName: "",
      flowName: ""
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
