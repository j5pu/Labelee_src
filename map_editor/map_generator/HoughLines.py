import cv2
import cv
import numpy as np

# Default parameters
INITIAL_RHO = 1
INITIAL_THETA = 1
INITIAL_THRESHOLD = 50
INITIAL_MIN_LINE_LENGTH = 0
INITIAL_MAX_LINE_GAP = 10
INITIAL_CANNY_THRESHOLD_1 = 150
INITIAL_CANNY_THRESHOLD_2 = 200
INITIAL_CANNY_SOBEL_SIZE = 3

class HoughLines():
    """Searches for lines in an image.

    Given an image and a set of parameters, the class performs
    the probabilistic Hough transform algorithm in an image in
    order to find lines in it.

    """

    def __init__(self, image,
                 rho=INITIAL_RHO,
                 theta=INITIAL_THETA,
                 threshold=INITIAL_THRESHOLD,
                 min_line_length=INITIAL_MIN_LINE_LENGTH,
                 max_line_gap=INITIAL_MAX_LINE_GAP,
                 canny_threshold_1=INITIAL_CANNY_THRESHOLD_1,
                 canny_threshold_2=INITIAL_CANNY_THRESHOLD_2,
                 canny_aperture=INITIAL_CANNY_SOBEL_SIZE):
        """ Inits the class and performs the calculation.

        Args:
              image: image to search lines in
              rho: distance resolution of the accumulator (recommended 1)
              theta: angle resolution of the accumulator (recommended 1)
              threshold: accumulator threshold parameter. Only lines with votes > threshold are accepted
              min_line_length: minimum line length
              max_line_gap: maximum allowed gap between points on the same line to link them
              canny_threshold_1: first threshold for the Canny filter
              canny_threshold_2: second threshold for the Canny filter
              canny_aperture: aperture size for the Sobel operator used in Canny filter (recommended 3)
        """

        # Image read
        self.img = cv2.imread(image)

        # Resulting lines
        self.lines = []

        # Image in gray
        self.gray = cv2.cvtColor(self.img,cv2.COLOR_BGR2GRAY)

        # Hough lines transform parameters
        self.rho = (rho if rho > 0 else 1)
        self.theta = (theta if theta > 0 else 1)
        self.threshold = (threshold if threshold > 0 else 1)
        self.min_line_length = min_line_length
        self.max_line_gap = max_line_gap

        # Canny filter parameters
        self.canny_threshold_1 = canny_threshold_1
        self.canny_threshold_2 = canny_threshold_2
        if canny_aperture != 3 and canny_aperture != 5 and canny_aperture != 7:
            canny_aperture = 3
        self.canny_aperture = canny_aperture

        self.compute()

    def compute(self):
        """ Performs Hough transform on class parameter data """

        # Canny edge filter
        self.edges = cv2.Canny(self.gray, self.canny_threshold_1, self.canny_threshold_2,
                               apertureSize = self.canny_aperture)
        self.lines = cv2.HoughLinesP(self.edges, self.rho, self.theta * np.pi/180, self.threshold,
                                     minLineLength=self.min_line_length, maxLineGap=self.max_line_gap)

    def getLines(self):
        """ Returns list of two points defining the lines computed by the Hough transform """
        resulting_lines = []
        try:
            for x1,y1,x2,y2 in self.lines[0]:
                line = {'point1': {'x': x1, 'y': y1},
                        'point2': {'x': x2, 'y': y2}}
                resulting_lines.append(line)
        except:
            # There are no lines
            pass
        return resulting_lines

    def __repr__(self):
        hough_params = "Hough prob. transfrom with rho=" + str(self.rho) +\
                       ", theta=" + str(self.theta) +\
                       ", thres=" + str(self.threshold) +\
                       ", min line length=" + str(self.min_line_length) +\
                       ", max line gap=" + str(self.max_line_gap)
        canny_params = "Inner Canny algorithm parameters are thre1=" + str(self.canny_threshold_1) +\
                       ", thre2=" + str(self.canny_threshold_2) +\
                       ", sobel size" + str(self.canny_aperture)

        return hough_params + '\n' + canny_params