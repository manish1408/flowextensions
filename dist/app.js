angular.module('app', ['flowchart','ui.tree'])
  .factory('prompt', function () {
    return prompt;
  })
  .config(function (NodeTemplatePathProvider) {
    NodeTemplatePathProvider.setTemplatePath("flowchart/node.html");
  })

  .controller('AppCtrl', function AppCtrl($scope, prompt, Modelfactory, flowchartConstants, $http) {

    var deleteKeyCode = 46;
    var ctrlKeyCode = 17;
    var aKeyCode = 65;
    var escKeyCode = 27;
    var nextNodeID = 10;
    var nextConnectorID = 1;
    var ctrlDown = false;
    

    /// The above function creates a right panel from the json file
    $scope.CreateRightPanel = function() {
      $http.get("json/nodePallete.json")
      .then(function(response) {
       $scope.NodePallete  = response.data;

      });
    };
    
    $scope.CreateRightPanel();

    var model = {
      nodes: [],
      edges: []
      };
      
    $scope.flowchartselected = [];
    var modelservice = Modelfactory(model, $scope.flowchartselected);

    $scope.model = model;
    $scope.modelservice = modelservice;



    $scope.addNewNode = function (nodeName) {
      var newNode = {
        name: nodeName.name,
        id: nextNodeID++,
        x: Math.floor(Math.random() * 500) + 1,
        y: Math.floor(Math.random() * 300) + 1,
        color: '#F15B26',
        properties: nodeName.properties ,
        connectors: []
      };

      nodeName.input_terminals.forEach(function(element) {
        newNode.connectors.push({ id: nextConnectorID++, type: flowchartConstants.topConnectorType, });
      }, this);

      nodeName.output_terminals.forEach(function(element) {
        newNode.connectors.push({ id: nextConnectorID++, type: flowchartConstants.bottomConnectorType, });
      }, this);

      model.nodes.push(newNode);
      
    };

    $scope.activateWorkflow = function () {
      angular.forEach($scope.model.edges, function (edge) {
        edge.active = !edge.active;
      });
    };

    $scope.addNewInputConnector = function () {
      var connectorName = prompt("Enter a connector name:", "New connector");
      if (!connectorName) {
        return;
      }

      var selectedNodes = modelservice.nodes.getSelectedNodes($scope.model);
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

      var selectedNodes = modelservice.nodes.getSelectedNodes($scope.model);
      for (var i = 0; i < selectedNodes.length; ++i) {
        var node = selectedNodes[i];
        node.connectors.push({ id: nextConnectorID++, type: flowchartConstants.bottomConnectorType });
      }
    };

    $scope.deleteSelected = function () {
      modelservice.deleteSelected();
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
        }
      }
    };
    modelservice.registerCallbacks($scope.callbacks.edgeAdded, $scope.callbacks.nodeRemoved, $scope.callbacks.edgeRemoved);

  });
