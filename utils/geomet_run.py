from geomet import wkt
import simplejson

f= open('/Users/josemanuelduque/Desktop/alcala.txt')
a = wkt.load(f)
sal = simplejson.dumps(a)

dest = open('/Users/josemanuelduque/Desktop/geojson.js', 'a')
dest.write(sal)
dest.close()