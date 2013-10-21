Feature: Logout User
  Scenario: Logout any user
    Given A user logged in
      | user_type         | username   | password    |
      | enclosure owner   | mnopiaaa   | 123qwe      |
    When I go to "/account/logout/" URL
    Then User is logged out