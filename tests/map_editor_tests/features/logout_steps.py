# -*- coding: utf-8 -*-
from lettuce import step
from tests.factories import EnclosureOwnerFactory


@step(u'Given A user logged in')
def given_a_user_logged_in(step):
    step_dict = step.hashes[0]
    step.behave_as("""
        Given A "<{user_type}>" user created with username "<{username}>" and password "<{password}>"
        When I go to "/map-editor/" URL
        And I fill in "username" with "<{username}>"
        And I fill in "password" with "<{password}>"
        And I press the login button
        Then I go to the "/map-editor/" index page
    """.format(
        user_type=step_dict['user_type'],\
        username=step_dict['username'],\
        password=step_dict['password']
    ))

@step(u'Then User is logged out')
def then_user_is_logged_out(step):
    assert False, 'This step must be implemented'