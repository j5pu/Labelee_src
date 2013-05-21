import sys


class dijkstra():
    floors = []
    walls = []
    qr = []
    connections = []

    def __init__(self, floors, walls, qr, connections):
        self.floors = floors
        self.walls = walls
        self.qr = qr
        self.connections = connections

    def __shortestpath__(self, graph, start, end, visited=[], distances={}, predecessors={}):
        # we've found our end node, now find the path to it, and return
        if start == end:

            path = []

            while end != None:
                path.append(end)

                end = predecessors.get(end, None)

            return distances[start], path[::-1]

        # detect if it's the first time through, set current distance to zero

        if not visited: distances[start] = 0

        # process neighbors as per algorithm, keep track of predecessors

        for neighbor in graph[start]:

            if neighbor not in visited:

                neighbordist = distances.get(neighbor, sys.maxint)

                tentativedist = distances[start] + graph[start][neighbor]

                if tentativedist < neighbordist:
                    distances[neighbor] = tentativedist

                    predecessors[neighbor] = start

        # neighbors processed, now mark the current node as visited

        visited.append(start)

        # finds the closest unvisited node to the start

        unvisiteds = dict((k, distances.get(k, sys.maxint)) for k in graph if k not in visited)

        closestnode = min(unvisiteds, key=unvisiteds.get)

        # now we can take the closest node and recurse, making it current

        return self.__shortestpath__(graph, closestnode, end, visited, distances, predecessors)

    def __createMap__(self):
        map = {}
        for floor in self.floors:
            for row in range(1, floor.num_rows + 1):
                for column in range(1, floor.num_cols + 1):
                    key = "{0}_{1}_{2}".format(row, column, floor.id)
                    if key in self.walls:
                        map[key] = 'W'
                    else:
                        map[key] = 'E'
        return map

    def __existConnection__(self, map, key):
        return key in map and map[key] != 'W'

    @staticmethod
    def getKey(row, column, numfloor):
        return "{0}_{1}_{2}".format(row, column, numfloor)

    def __getConnections__(self, row, column, map, numfloor):
        """

        :param map:
        :param numMap:
        :param row:
        :param column:
        :return:
        """
        connection = {}
        keys = [self.getKey(row - 1, column, numfloor), self.getKey(row, column + 1, numfloor),
                self.getKey(row + 1, column, numfloor),
                self.getKey(row, column - 1, numfloor)]
        for key in keys:
            if self.__existConnection__(map, key):
                connection[key] = 1
        return connection

    def __createGraph__(self, map):
        graph = {}
        for floor in self.floors:
            for row in range(1, floor.num_rows + 1):
                for column in range(1, floor.num_cols + 1):
                    key = self.getKey(row, column, floor.id)
                    if map[key] != 'W':
                        graph[key] = self.__getConnections__(row, column, map, floor.id)

        return graph

    def calculateDijkstra(self):
        map = self.__createMap__()
        graph = self.__createGraph__(map)
        result = []

        for origin in self.qr:
            for destination in self.qr:
                if origin.point.id != destination.point.id:
                    path = self.__shortestpath__(graph, self.getKey(origin.point.row, origin.point.col,
                                                                    origin.point.floor.id),
                                                 self.getKey(destination.point.row, destination.point.col,
                                                             destination.point.floor.id), visited=[], distances={}
                        , predecessors={})
                    result.append([origin, destination, path])

        return result
        #  print shortestpath(test,getKey(1,1,1), getKey(4,5,1))

