Feature: Logout User
  Scenario: Logout any user
    Given A user logged in
      | user_type | username | password |
      | staff | mnopiaaa | 123qwe |
    When User logs out
    Then User is logged out