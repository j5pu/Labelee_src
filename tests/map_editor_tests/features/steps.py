# -*- coding: utf-8 -*-
from lettuce.django import django_url
from lettuce import step, world
from map_editor.models import Enclosure
from tests.factories import *

#
# Scenario: Login staff user
#
from tests.helpers import URLS, response_is_a_redirection


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


#
# Scenario: Login staff user
#
# @step(u'Given A "([^"]*)" user created with username "([^"]*)" and password "([^"]*)"')
# def given_a_group1_user_created_with_username_group2_and_password_group3(step, group1, group2, group3):
#     if group1 == 'staff':
#         world.user = StaffFactory(username=group2, password=group3)
#     elif group1 == 'enclosure owner without enclosure':
#         world.user = EnclosureOwnerFactory(username=group2, password=group3)
#     elif group1 == 'enclosure owner with enclosure':
#         enc = EnclosureFactory(
#             owner=EnclosureOwnerFactory(username=group2, password=group3))
#         assert enc.id is not None
#         world.user = enc.owner
#     elif group1 == 'site owner':
#         world.user = SiteOwnerFactory(username=group2, password=group3)
#     elif group1 == 'invalid':
#         world.user = InvalidUserFactory(username=group2, password=group3)
#
#     assert world.user.id is not None


# @step(u'And I cant access if i am enclosure owner without any enclosure')
# def and_i_can_t_access_if_i_am_enclosure_owner_without_any_enclosure(step):
#     assert world.urls['login'] in world.browser.url
#
#
# @step(u'And I am redirected to dashboard if i have one or more')
# def and_i_am_redirected_to_dashboard_if_i_have_one_or_more(step):
#     assert world.urls['dashboard'] in world.browser.path
#
#
# @step(u'And I cant access if i am site owner')
# def and_i_can_t_access_if_i_am_site_owner(step):
#     assert world.urls['login'] in world.browser.url
#
# @step(u'Then I go to the "([^"]*)" index page')
# def then_i_go_to_the_group1_index_page(step, group1):
#     assert False, 'This step must be implemented'


@step(u'And user logs out')
def and_user_logs_out(step):
    step.behave_as("""When User logs out""")

@step(u'Given A user logged in')
def given_a_user_logged_in(step):
    step_dict = step.hashes[0]
    step.behave_as("""
        Given A staff user created with username "{username}" and password "{password}"
        When I go to "/map-editor/" URL
            And I fill in "username" with "{username}"
            And I fill in "password" with "{password}"
            And I press the login button
    """.format(
        username=step_dict['username'],
        password=step_dict['password']
    ))

@step(u'When User logs out')
def when_user_logs_out(step):
    step.behave_as("""When I go to "{url}" URL""".format(url=URLS['map_editor']['logout']))

@step(u'Then User is logged out')
def then_user_is_logged_out(step):
    assert response_is_a_redirection()
    assert world.browser.response.status == 302
    # si ahora intentamos acceder a /map-editor/ se nos redirigirá al login
    world.browser.visit(world.urls['index'])
    assert world.response_is_a_redirection()
    # is_redirected_to_login = '/accounts/login/' in resp._headers['location'][1]
    # testCase.assertTrue(is_redirected_to_login)

@step(u'Then I see the admin page showing all enclosures saved on app')
def then_i_see_the_admin_page_showing_all_enclosures_saved_on_app(step):
    assert len(world.browser.find_by_css('td.enclosure')) == 3

@step(u'And A few enclosures created with different owners')
def and_a_few_enclosures_created_with_different_owners(step):
    world.enclosures = EnclosureFactory.create_batch(3)
    assert len(Enclosure.objects.all()) == 3

@step(u'Given An enclosure owner user created with username "([^"]*)" and password "([^"]*)"')
def given_an_enclosure_owner_user_created_with_username_group1_and_password_group2(step, group1, group2):
    world.user = EnclosureOwnerFactory(username=group1, password=group2)
    world.password = group2

@step(u'And one enclosure called "([^"]*)" for him')
def and_one_enclosure_called_group1_for_him(step, group1):
    world.enclosure = EnclosureFactory(owner=world.user)

@step(u'When I log on map editor')
def when_i_log_on_map_editor(step):
    step.behave_as("""
        When I go to "/map-editor/" URL
            And I fill in "username" with "{username}"
            And I fill in "password" with "{password}"
            And I press the login button
    """.format(
        username=world.user.username,
        password=world.password
    ))

@step(u'Then I am redirected to my first enclosures dashboard')
def then_i_am_redirected_to_my_first_enclosures_dashboard(step):
    assert False, 'This step must be implemented'

@step(u'And I cant see the admin page')
def and_i_cant_see_the_admin_page(step):
    assert False, 'This step must be implemented'
@step(u'Then I am logged out by the system')
def then_i_am_logged_out_by_the_system(step):
    assert False, 'This step must be implemented'
@step(u'And I cant see nothing')
def and_i_cant_see_nothing(step):
    assert False, 'This step must be implemented'