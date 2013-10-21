# -*- coding: utf-8 -*-
from lettuce.django import django_url
from tests.map_editor_tests.helpers import *
from lettuce import step, world
from tests.factories import StaffFactory, SiteOwnerFactory, EnclosureOwnerFactory


@step(u'Given A staff user created with username "([^"]*)" and password "([^"]*)"')
def given_a_staff_user_created_with_username_group1_and_password_group2(step, group1, group2):
    world.staff = StaffFactory(username=group1, password=group2)
    assert world.staff.id is not None


@step(u'When I go to "([^"]*)" URL')
def when_i_go_to_group1_url(step, group1):
    world.browser.visit(django_url(group1))


@step(u'And I fill in "([^"]*)" with "([^"]*)"')
def and_i_fill_in_group1_with_group2(step, group1, group2):
    world.browser.fill(group1, group2)


@step(u'And I press the login button')
def and_i_press_the_login_button(step):
    world.browser.find_by_css('#login .btn').click()


@step(u'Then I go to the "([^"]*)" index page')
def then_i_go_to_the_group1_index_page(step, group1):
    assert world.browser.path == world.urls['index']
    assert world.urls['login'] not in world.browser.url

    # When I go to "/account/logout/" URL

@step(u'Given A "([^"]*)" user created with username "([^"]*)" and password "([^"]*)"')
def given_a_group1_user_created_with_username_group2_and_password_group3(step, group1, group2, group3):
    if group1 == 'staff':
        world.user = StaffFactory(username=group2, password=group3)
    elif group1 == 'enclosure owner':
        world.user = EnclosureOwnerFactory(username=group2, password=group3)
    elif group1 == 'site owner':
        world.user = SiteOwnerFactory(username=group2, password=group3)

    assert world.user.id is not None


@step(u'And user logs out')
def and_user_logs_out(step):
    # step.behave_as("""
    #     Given I go to the home page
    #       And I click the login button
    #       And I fill in username:{user} password:{pass}
    #       And I click "Login"
    # """.format(user='floppy', pass='banana'))
    step.behave_as("""When I go to "/account/logout/" URL""")