Feature: Login User
    Scenario: Login staff user
        Given A staff user created with username "mnopi" and password "1234"
        When I go to "/map-editor/" URL
        And I fill in "username" with "mnopi"
        And I fill in "password" with "1234"
        And I press the login button
        Then I go to the "/map-editor/" index page
        And user logs out

    Scenario Outline: Login any user
        Given A "<user_type>" user created with username "<username>" and password "<password>"
        When I go to "/map-editor/" URL
        And I fill in "username" with "<username>"
        And I fill in "password" with "<password>"
        And I press the login button
        Then I go to the "/map-editor/" index page
        And user logs out
    Examples:
        | user_type       | username  | password  |
        | staff           | mnopiaa     | 1aragon1  |
        | enclosure owner | 1234      | 1234      |
        | site owner      | z@etsx2   | adminnnn  |
