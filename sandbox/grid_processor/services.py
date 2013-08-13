from map_editor.models import Floor
from sandbox.grid_processor.utils import renderEmpty


def process(request, floor_id):
    """
    /grid-processor/<floor_id>/?rows=30
    """
    # floor = Floor.objects.get(id=floor_id)
    # renderEmpty(request, floor)



