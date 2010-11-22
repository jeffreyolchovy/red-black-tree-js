(function(R, B) {
  Tree = function() {
    return arguments.length && arguments.length == 4
      ? new Node(arguments[0], arguments[1], arguments[2], arguments[3])
      : new Leaf();
  };

  Tree.prototype.isLeaf = function() {
    return this instanceof Leaf;
  };

  var Node = function(color, left, value, right) {
    this.color  = color;
    this.left   = left;
    this.value  = value;
    this.right  = right;
  };

  var F = new Function();
  F.prototype = Tree.prototype;
  Node.prototype = new F();

  Node.prototype.balanceLeft = function() {
    switch(true) {
      case this.color == B && this.left.color == R && this.left.left.color == R:
        var value = this.left.value,
            right = new Node(B, this.left.right, this.value, this.right),
            left  = new Node(B, this.left.left.left, this.left.left.value,
                      this.left.left.right);  

        return new Node(R, left, value, right);

      case this.color == B && this.left.color == R && this.left.right.color == R:
        var value = this.left.right.value,
            right = new Node(B, this.left.right.right, this.value, this.right);
            left  = new Node(B, this.left.left, this.left.value,
                      this.left.right.left);

        return new Node(R, left, value, right);

      default: 
        return this;
    }
  };

  Node.prototype.balanceRight = function() {
    switch(true) {
      case this.color == B && this.right.color == R && this.right.right.color == R:
        var value = this.right.value,
            left  = new Node(B, this.left, this.value, this.right.left),
            right = new Node(B, this.right.right.left, this.right.right.value,
                      this.right.right.right);

        return new Node(R, left, value, right);

      case this.color == B && this.right.color == R && this.right.left.color == R:
        var value = this.right.left.value,
            left  = new Node(B, this.left, this.value, this.right.left.left),
            right = new Node(B, this.right.left.right, this.right.value,
                      this.right.right);

        return new Node(R, left, value, right);

      default:
        return this;
    }
  };

  Node.prototype.insert = function(value) {
    return (function(node) {
      var self = arguments.callee;

      if(node instanceof Leaf) {
        return new Leaf().insert(value);
      } else if(value < node.value) {
        return new Node(
          node.color,
          self.call(node, node.left),
          node.value,
          node.right).balanceLeft();
      } else if(value > node.value) {
        return new Node(
          node.color,
          node.left,
          node.value,
          self.call(node, node.right)).balanceRight();
      } else {
        return node;
      }
    })(this).blacken();
  };

  Node.prototype.contains = function(value) {
    switch(true) {
      case value < this.value:
        return this.left.contains(value);

      case value > this.value:
        return this.right.contains(value);

      case value == this.value:
        return this;

      default:
        return null;
    } 
  };

  Node.prototype.size = function() {
    return this.left.size() + 1 + this.right.size();
  };

  Node.prototype.depth = function() {
    return Math.max(this.left.depth(), this.right.depth()) + 1;
  };

  Node.prototype.first = function() {
    if(this.left instanceof Leaf) {
      return this;
    } else {
      return this.left.first();
    }
  };

  Node.prototype.last = function() {
    if(this.right instanceof Leaf) {
      return this
    } else {
      return this.right.last();
    }
  };

  Node.prototype.blacken = function() {
    return this.copy({color: B});
  };

  Node.prototype.copy = function(/* diff */) {
    var copy = new Leaf().insert(this.value);
        diff = arguments[0] || {};

    for(var key in copy) {
      if(key in diff && copy.hasOwnProperty(key))
        copy[key] = diff[key];
      else
        copy[key] = this[key];
    } 

    return copy;
  };

  Node.prototype.merge = function(node) {
    return this.fromArray(node.toArray(), this);
  };

  Node.prototype.toArray = function() {
    return this.left.toArray().concat([this.value], this.right.toArray());
  };

  Node.prototype.fromArray = function(array /*, acc*/) {
    return (function(index, acc) {
      var self = arguments.callee;

      if(index < array.length) {
        return self.call(acc, index + 1, acc.insert(array[index]));  
      } else {
        return acc;
      }
    })(0, arguments[1] || new Leaf());
  };

  Node.prototype.toString = function() {
    return "Node(" + this.color + ", " + this.value + ")";
  };

  var Leaf = function() {
    this.color = B;
    this.left  = null;
    this.value = null;
    this.right = null;
  };

  var F = new Function();
  F.prototype = Node.prototype
  Leaf.prototype = new F();

  Leaf.prototype.insert = function(value) {
    return new Node(R, new Leaf(), value, new Leaf());
  };

  Leaf.prototype.remove = function(value) {
    return null;
  };

  Leaf.prototype.contains = function() {
    return null;
  };

  Leaf.prototype.nodes = function() {
    return [];
  };

  Leaf.prototype.edges = function() {
    return [];
  };

  Leaf.prototype.size = function() {
    return 0;
  };

  Leaf.prototype.depth = function() {
    return 0;
  };

  Leaf.prototype.first = function() {
    return null;
  };

  Leaf.prototype.last = function() {
    return null;
  };

  Leaf.prototype.copy = function() {
    return new Leaf();
  };

  Leaf.prototype.paths = function() {
    return [];
  };

  Leaf.prototype.toArray = function() {
    return [];
  };

  Leaf.prototype.toString = function() {
    return "Leaf";
  };
})("red", "black");

Tree.prototype.nodes = function() {
  return this.left.nodes().concat([this], this.right.nodes());
};

Tree.prototype.edges = function() {
  var edges = [];

  if(!this.left.isLeaf()) {
    edges.push([this.value, this.left.value, "L"]);
  }

  if(!this.right.isLeaf()) {
    edges.push([this.value, this.right.value, "R"]);
  }

  return edges.concat(this.left.edges(), this.right.edges());
};

Tree.prototype.paths = function(/* accumulation */) {
  var accumulation = arguments[0] || [],
      paths = [];

  if(!this.left.isLeaf()) {
    paths.push(accumulation.slice(0, -1).concat([this.value, this.left.value]));
  }

  if(!this.right.isLeaf()) {
    paths.push(accumulation.slice(0, -1).concat([this.value, this.right.value]));
  }

  return paths.concat(this.left.paths(paths[0] || []), this.right.paths(paths[0] || []));
};

Tree.prototype.toDot = function() {
  var edges = this.edges(),
      nodes = this.nodes(),
      out   = [];

  for(var i = 0, j = nodes.length; i < j; i++) {
    var node = nodes[i], font = node.color == "red" ? "black" : "white";
    out.push(node.value + " [fontcolor=" + font + ",fillcolor=" + node.color + ",style=filled];");
  }

  for(var i = 0, j = edges.length; i < j; i++) {
    var edge = edges[i];
    out.push(edge[0] + " -> " + edge[1] + " [label=\"" + edge[2] + "\"];");
  }
  
  out.unshift("digraph G {");
  out.push("}");

  return out.join("\n");
};


/* Usage:
*
* var tree = new Tree().fromArray([26, 17, 41, 10, 12, 16, 15, 30, 28, 35, 39, 47, 23, 20]);
* tree = tree.insert(23);
* 
* console.log(tree.toDot());
*/
