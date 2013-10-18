# -*- coding: utf-8 -*-
from lettuce import step

@step(u'Given A staff user created with username "([^"]*)" and password "([^"]*)"')
def given_a_staff_user_created_with_username_group1_and_password_group2(step, group1, group2):
    assert False, 'This step must be implemented'
@step(u'When I go to the "([^"]*)" URL')
def when_i_go_to_the_group1_url(step, group1):
    assert False, 'This step must be implemented'
@step(u'And I fill in "([^"]*)" with "([^"]*)"')
def and_i_fill_in_group1_with_group2(step, group1, group2):
    assert False, 'This step must be implemented'
@step(u'And I press the login button')
def and_i_press_the_login_button(step):
    assert False, 'This step must be implemented'
@step(u'Then I go to the "([^"]*)" index page')
def then_i_go_to_the_group1_index_page(step, group1):
    assert False, 'This step must be implemented'