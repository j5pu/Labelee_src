"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
from calculateRoutes import StepIterator
from calculateRoutes import BeautifyIterator
from calculateRoutes import RouteInconsistencyException
from map_editor.models import Point, Floor
from route.models import Step

from django.test import TestCase

class StepIteratorTest(TestCase):
    def test_basic_horizontal_line(self):
        path = ['0_0_1', '0_1_1', '0_2_1', '0_3_1']
        correct_result = ['0_0_1', '0_3_1']
        result = [point for point in StepIterator(path)]
        self.assertEqual(result, correct_result)

    def test_basic_vertical_line(self):
        path = ['0_0_1', '1_0_1', '2_0_1', '3_0_1']
        correct_result = ['0_0_1', '3_0_1']
        result = [point for point in StepIterator(path)]
        self.assertEqual(result, correct_result)

    def test_basic_diagonal_line(self):
        path = ['5_5_1', '4_4_1', '3_3_1', '2_2_1']
        correct_result = ['5_5_1', '2_2_1']
        result = [point for point in StepIterator(path)]
        self.assertEqual(result, correct_result)

    def test_basic_change_floor(self):
        path = ['0_0_1', '0_0_2']
        correct_result = ['0_0_1', '0_0_2']
        result = [point for point in StepIterator(path)]
        self.assertEqual(result, correct_result)

    def test_basic_single_step(self):
        path = ['0_0_1']
        correct_result = ['0_0_1']
        result = [point for point in StepIterator(path)]
        self.assertEqual(result, correct_result)

    def test_change_floor_in_line(self):
        path = ['0_0_1', '1_0_1', '2_0_3']
        correct_result = ['0_0_1', '1_0_1', '2_0_3']
        result = [point for point in StepIterator(path)]
        self.assertEqual(result, correct_result)

    def test_inconsistency_exception(self):
        path = ['0_0_1', '2_0_1']
        with self.assertRaises(RouteInconsistencyException):
            [point for point in StepIterator(path)]
        path = ['0_0_1', '0_2_1']
        with self.assertRaises(RouteInconsistencyException):
            [point for point in StepIterator(path)]
        path = ['0_0_1', '0_0_1']
        with self.assertRaises(RouteInconsistencyException):
            [point for point in StepIterator(path)]


    def test_complex_route(self):
        path = ['0_0_0', '1_0_0', '2_0_0', '2_1_0', '2_2_0', '1_2_0', '1_3_0', '2_4_0', '3_5_0', '4_6_0', '4_7_0',
                '4_8_0', '4_9_0', '4_10_0', '4_11_0', '3_11_0', '2_12_0', '3_13_0', '4_12_0', '4_12_1', '4_12_2',
                '5_12_2', '6_12_2']
        correct_result = ['0_0_0', '2_0_0', '2_2_0', '1_2_0', '1_3_0', '4_6_0', '4_11_0', '3_11_0', '2_12_0', '3_13_0',
                          '4_12_0', '4_12_1', '4_12_2', '6_12_2']
        result = [point for point in StepIterator(path)]
        self.assertEqual(result, correct_result)


class BeautifyIteratorTest(TestCase):

    @staticmethod
    def point_to_step(point):
        step = Step()
        step.row, step.column, step.floor_id = point.split("_")
        return step

    def test_zero_case(self):
        path = ['1_1_1']
        correct_result = ['1_1_1']
        result = [point for point in BeautifyIterator(path,[])]
        self.assertEqual(result, correct_result)

    def test_single_case(self):
        path = ['1_1_1', '5_3_1']
        correct_result = ['1_1_1', '5_3_1']
        result = [point for point in BeautifyIterator(path,[])]
        self.assertEqual(result, correct_result)

    def test_no_walls_1(self):
        path = ['1_1_1', '3_3_1', '3_4_1']
        correct_result = ['1_1_1', '3_4_1']
        result = [point for point in BeautifyIterator(path,[])]
        self.assertEqual(result, correct_result)

    def test_no_walls_2(self):
        path = ['1_1_1', '3_3_1', '3_4_1', '7_4_1']
        correct_result = ['1_1_1', '7_4_1']
        correct_result = [point for point in correct_result]
        result = [point for point in BeautifyIterator(path,[])]
        self.assertEqual(result, correct_result)

    def test_distinct_floors(self):
        path = ['1_1_1', '2_2_1', '2_2_2']
        correct_result = ['1_1_1', '2_2_1', '2_2_2']
        result = [point for point in BeautifyIterator(path,[])]
        self.assertEqual(result, correct_result)


    def test_wall_1(self):
        path = ['1_1_1', '2_2_1', '2_3_1']
        correct_result = ['1_1_1', '2_2_1', '2_3_1']

        walls = ['1_2_1']

        result = [point for point in BeautifyIterator(path, walls)]
        self.assertEqual(result, correct_result)


    def test_wall_2(self):
        path = ['1_1_1', '2_2_1', '2_5_1']
        correct_result = ['1_1_1', '2_2_1', '2_5_1']

        walls = ['1_3_1']

        result = [point for point in BeautifyIterator(path, walls)]
        self.assertEqual(result, correct_result)

    def test_wall_3(self):
        path = ['1_1_1', '2_2_1', '2_5_1']
        correct_result = ['1_1_1', '2_5_1']

        walls = ['5_1_1']

        result = [point for point in BeautifyIterator(path,walls)]
        self.assertEqual(result, correct_result)

    def test_wall_4(self):
        path = ['1_1_1', '2_2_1', '2_3_1', '3_4_1', '4_4_1', '5_4_1', '5_3_1']
        correct_result = ['1_1_1', '2_3_1', '3_4_1','5_3_1']

        walls = ['3_3_1', '3_2_1']

        result = [point for point in BeautifyIterator(path,walls)]
        self.assertEqual(result, correct_result)

