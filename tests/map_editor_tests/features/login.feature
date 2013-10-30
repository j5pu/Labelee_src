Feature: Login to map editor app

    Scenario: Login staff user
        Given A staff user created with username "<username>" and password "<password>"
            And A few enclosures created with different owners
        When I go to "/map-editor/" URL
            And I fill in "username" with "<username>"
            And I fill in "password" with "<password>"
            And I press the login button
        Then I see the admin page showing all enclosures saved on app
            And user logs out

        Examples:
            | username | password |
            | mnopi | 1234 |
            | 1234 | 1234 |
            | 1234aa | 1234zzz |
            | z@etsx2 | adminnnn |
            | z@etsx2ww | adaaaminnnn |

    Scenario: Login enclosure owner with one enclosure
        Given An enclosure owner user created with username "<username>" and password "<password>"
            And one enclosure called "<enclosure_name>" for him
        When I log on map editor
        Then I am redirected to my first enclosures dashboard
            And I cant see the admin page
        Examples:
        | username | password | enclosure_name |
        | mnopi | 1234 | alcala magna |

    Scenario: Login enclosure owner without any enclosure
        Given An enclosure owner user created with username "<username>" and password "<password>"
        When I log on map editor
        Then I am logged out by the system
            And I cant see nothing
        Examples:
        | username | password | enclosure_name |
        | mnopi | 1234 | alcala magna |



#    Scenario Outline: Login different types of user
#        Given A "<user_type>" user created with username "<username>" and password "<password>"
#            And 3 enclosures created
#        When I go to "/map-editor/" URL
#            And I fill in "username" with "<username>"
#            And I fill in "password" with "<password>"
#            And I press the login button
#        Then If user is staff:
#            And If user is enclosure owner with one or more enclosures:
#            And If user is enclosure owner without any enclosure: I am logged out
#            And If user is site owner: I am logged out
#            And If user is invalid (not staff and not belongs to any user group): I am logged out
#    Examples:
#        | user_type | username | password |
#        | staff | mnopiaa | 1aragon1 |
#        | enclosure owner without enclosure | 1234 | 1234 |
#        | enclosure owner with enclosure | 1234aa | 1234zzz |
#        | site owner | z@etsx2 | adminnnn |
#        | invalid | z@etsx2ww | adaaaminnnn |
