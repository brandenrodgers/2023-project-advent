import React, { useState } from "react";
import {
  Divider,
  Button,
  Text,
  Heading,
  List,
  Link,
  Input,
  Flex,
  hubspot,
} from "@hubspot/ui-extensions";

hubspot.extend(({ context }) => <SecretSanta context={context} />);

const SecretSanta = ({ context }) => {
  const [person, setPerson] = useState("");
  const [people, setPeople] = useState([]);
  const [pairings, setPairings] = useState([]);

  const addPerson = () => {
    if (person) {
      setPeople([...people, person]);
      setPerson("");
    }
  };

  const removePerson = (i) => {
    const firstArr = people.slice(0, i);
    const secondArr = people.slice(i + 1);
    setPeople([...firstArr, ...secondArr]);
  };

  const generatePairings = () => {
    const numPeople = people.length;
    let newPairings = [];

    const attemptToPair = () => {
      newPairings = people.map((person) => ({ person, buyingFor: null }));

      for (let i = 0; i < newPairings.length; i++) {
        let successfullyChoseAPersonToBuyFor = false;
        let tries = 0;

        while (!successfullyChoseAPersonToBuyFor && tries < 50) {
          const randomIndex = Math.floor(Math.random() * numPeople);
          const isOtherPerson = randomIndex !== i;
          const personIsNotBeingBoughtForYet = !newPairings.some(
            (pairing) => pairing.buyingFor === people[randomIndex]
          );
          const personisNotReciprocating =
            newPairings[randomIndex].buyingFor !== people[i];

          if (
            isOtherPerson &&
            personIsNotBeingBoughtForYet &&
            personisNotReciprocating
          ) {
            newPairings[i] = {
              ...newPairings[i],
              buyingFor: people[randomIndex],
            };
            successfullyChoseAPersonToBuyFor = true;
          }
          tries++;
        }
      }
    };

    let successfullyPaired = false;
    let tries = 0;

    while (!successfullyPaired && tries <= 10) {
      attemptToPair();
      if (newPairings.every((pairing) => !!pairing.buyingFor)) {
        successfullyPaired = true;
      } else {
        tries++;
      }
    }

    if (successfullyPaired) {
      setPairings(newPairings);
    }
  };

  const renderPeople = () => {
    if (!people.length) {
      return <Heading>No participants</Heading>;
    }

    return (
      <>
        <Heading>People</Heading>
        <List variant="unordered">
          {people.map((person, i) => {
            return (
              <Text key={`${person}-${i}`}>
                {person} <Link onClick={() => removePerson(i)}>(x)</Link>
              </Text>
            );
          })}
        </List>
      </>
    );
  };

  const renderPairings = () => {
    if (!pairings.length) {
      return null;
    }

    return (
      <>
        <Heading>Pairings</Heading>
        <List variant="unordered">
          {pairings.map((pairing, i) => {
            return (
              <Flex key={`${person}-${i}`} gap="extra-small">
                <Text format={{ fontWeight: "bold" }}>{pairing.person}</Text>
                <Text> is buying for: {pairing.buyingFor}</Text>
              </Flex>
            );
          })}
        </List>
      </>
    );
  };

  return (
    <Flex direction="column" gap="medium">
      <Flex direction="row" gap="extra-small">
        <Text>Secret Santa Selector for </Text>
        <Text format={{ fontWeight: "bold" }}>{context.user.firstName}</Text>
      </Flex>

      <Divider />

      <Flex direction="row" align="end" gap="small">
        <Input
          name="text"
          label="Add new people to secret santa"
          value={person}
          onInput={(t) => setPerson(t)}
        />
        <Button type="submit" onClick={addPerson}>
          Add
        </Button>
      </Flex>

      {renderPeople()}

      <Button
        type="submit"
        onClick={generatePairings}
        disabled={people.length <= 2}
      >
        Generate pairings{people.length <= 2 ? " (min 3 people required)" : ""}
      </Button>

      {renderPairings()}
    </Flex>
  );
};
