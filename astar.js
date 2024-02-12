const aStar = (function () {
  class Node {
    constructor(x, y, isPassable) {
      this.x = x;
      this.y = y;
      this.isPassable = isPassable;
      this.g = Infinity; // cost from start node to current node
      this.h = 0; // estimated cost from current node to goal node
      this.f = Infinity; // total cost (g + h)
      this.parent = null; // parent node
    }

    // Calculate the Manhattan distance heuristic from this node to the goal node
    calculateHeuristic(goal) {
      this.h = Math.abs(this.x - goal.x) + Math.abs(this.y - goal.y);
    }
  }

  function aStar(start, goal, grid) {
    // Initialize open and closed sets
    let openSet = [start];
    let closedSet = [];

    // Set initial costs for start node
    start.g = 0;
    start.calculateHeuristic(goal);
    start.f = start.g + start.h;

    while (openSet.length > 0) {
      // Find node with the lowest f value in open set
      let current = openSet.reduce((minNode, node) => (node.f < minNode.f ? node : minNode));

      // If current node is the goal, reconstruct and return path
      if (current === goal) {
        return reconstructPath(current);
      }

      // Move current node from open set to closed set
      openSet = openSet.filter((node) => node !== current);
      closedSet.push(current);

      // Get neighbors of current node
      let neighbors = getNeighbors(current, grid);

      for (let neighbor of neighbors) {
        // Skip neighbor if it's impassable or already in the closed set
        if (!neighbor || !neighbor.isPassable || closedSet.includes(neighbor)) {
          continue;
        }

        // Calculate tentative g value for neighbor
        let tentativeG = current.g + 1; // Assuming each move costs 1

        // If tentative g value is lower, update neighbor
        if (tentativeG < neighbor.g) {
          neighbor.parent = current;
          neighbor.g = tentativeG;
          neighbor.calculateHeuristic(goal);
          neighbor.f = neighbor.g + neighbor.h;

          // Add neighbor to open set if not already present
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    // No path found
    return [];
  }

  // Function to reconstruct the path from goal node to start node
  function reconstructPath(node) {
    let path = [];
    while (node !== null) {
      path.unshift({ x: node.x, y: node.y });
      node = node.parent;
    }
    return path;
  }

  // Function to get neighboring nodes of a given node
  function getNeighbors(node, grid) {
    let neighbors = [];
    let directions = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ]; // Up, Right, Down, Left

    for (let dir of directions) {
      let newX = node.x + dir.dx;
      let newY = node.y + dir.dy;
      if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
        neighbors.push(grid[newX][newY]);
      }
    }

    return neighbors;
  }

  return {
    Node,
    find: aStar,
  };
})();
