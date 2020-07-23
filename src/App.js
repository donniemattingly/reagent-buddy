import React, {useState} from 'react';
import {useForm} from 'react-hook-form'
import styled from 'styled-components';
import './App.css';

const antibodyToAllelesMap = {
    'Bw4': ['B5', 'B5102', 'B5103', 'B13', 'B17', 'B27', 'B37', 'B38', 'B16', 'B44', 'B12', 'B47', 'B49', 'B51', 'B5', 'B52', 'B5', 'B53', 'B57', 'B17', '17', 'B58', 'B17', 'B59', 'B63', 'B15', 'B77', 'B15', 'A9', 'A23', 'A9', 'A24', 'A9', 'A2403', 'A25', 'A10', 'A32', 'A19'],
    'Bw6': ['B7', 'B703', 'B8', 'B14', 'B18', 'B22', 'B2708', 'B35', 'B39', 'B16', 'B3901', 'B3902', 'B40', 'B4005', 'B41', 'B42', 'B45', 'B12', 'B46', 'B48', 'B50', 'B21', 'B54', 'B22', 'B55', 'B22', 'B56', 'B22', 'B60', 'B40', 'B61', 'B40', 'B62', 'B15', 'B64', 'B14', 'B65', 'B14', 'B67', 'B70', 'B71', 'B70', 'B72', 'B70', 'B73', 'B75', 'B15', 'B76', 'B15', 'B78', 'B81', 'B82'],
    'A2': ['A2', 'A203', 'A210'],
    'A9': ['A9', 'A23', 'A24', 'A2403'],
    'B8': ['B8'],
    'B27': ['B27', 'B2708'],
    'B12': ['B12', 'B44', 'B45'],
    'A3': ['A3'],
    'B7': ['B7', 'B703'],
};

const allelesToAntibodiesMap = Object.fromEntries(
    Object.keys(antibodyToAllelesMap)
        .flatMap(i => antibodyToAllelesMap[i].map(j => [j, i])));

const antibodyForAllele = allele => allelesToAntibodiesMap[allele]

const allelesFromInput = (input) => input.split(';').flatMap(it => it.split(',')).map(it => it.trim()).map(it => it.toUpperCase())

const determineAvailableAntibodies = (p1, p2Antibodies, p2Alleles) => {
    return p1.filter(i => !p2Antibodies.includes(i))
        .filter(antibody =>
            !antibodyToAllelesMap[antibody].reduce((anyMatch, allele) => anyMatch || p2Alleles.includes(allele), false)
        )
}


const determineUsableAntibodies = (donor, recipient) => {
    const donorAntibodyPairs = donor.map(allele => [allele, antibodyForAllele(allele)]).filter(i => !!i[1])
    const donorMap = Object.fromEntries(donorAntibodyPairs)
    const donorAntibodies = donorAntibodyPairs.map(i => i[1])

    const recipientAntibodyPairs = recipient.map(allele => [allele, antibodyForAllele(allele)]).filter(i => !!i[1])
    const recipientMap = Object.fromEntries(recipientAntibodyPairs)
    const recipientAntibodies = recipientAntibodyPairs.map(i => i[1])

    const availableDonorAntibodies = determineAvailableAntibodies(donorAntibodies, recipientAntibodies, recipient)
    const availableRecipientAntibodies = determineAvailableAntibodies(recipientAntibodies, donorAntibodies, donor)

    return {
        donor: {
            available: availableDonorAntibodies,
            antibodies: donorMap
        },
        recipient: {
            available: availableRecipientAntibodies,
            antibodies: recipientMap
        }
    }
}

const HLATypingForm = styled.form`
  display: flex;
  flex-direction: column;
  
  background: #FFFFFF 0 0 no-repeat padding-box;
  box-shadow: 3px 3px 25px #0000001C;
  border-radius: 9px;
  opacity: 1;
  margin-top: 1em;
  padding: 2em;
`

const Results = styled.div`
  background: #FFFFFF 0 0 no-repeat padding-box;
  box-shadow: 3px 3px 25px #0000001C;
  border-radius: 9px;
  opacity: 1;
  margin-top: 1em;
  padding: 2em;
  
  font-size: 1em;
`

const Antibodies = styled.span`
  font-weight: bold;
`

const MatchStatus = styled.div`
  font-size: 2em;
  font-weight: bold;
  
  color: ${props => props.match ? colors.success : colors.danger};
`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

export const colors = {
    white: "#FFFFFF",
    primary: "#1E424C",
    unselectedCheckbox: "#DDDFE7",
    lighterText: "#495057",
    focus: "#6C63FF5C",
    danger: "#FF101C",
    success: "#3ACC6C",
    unselectedNavIcon: "#878787"
};

const Label = styled.label`
 font-size: 1.2em;
  margin-bottom: .4em;
`

const Button = styled.button`
    width: 100%;
    border-radius: 2em;
    font-size: 1em;
    padding: calc(0.5em - 1px) 1em;
    text-transform: capitalize;
    text-align: center;
    opacity: 1;
    height: 50px;
    
    background-color: ${props => props.isDanger ? colors.danger : colors.primary};
    color: #FFFFFFDE;
    border: 0;
`

const Input = styled.input`
  border-radius: 8px;
  background: ${colors.white};
  color: ${colors.lighterText};
  font-size: 1em;
  padding: calc(0.75em - 1px) calc(0.75em - 1px);
  box-shadow: 3px 3px 25px #0000001C;
  border: 2px solid ${props => props.error ? colors.danger : colors.white};
  outline: none;
  :focus {
      border: 2px solid #6C63FF5C;
  }
  margin-bottom: 1em;
`

const AppContainer = styled.div`
  max-width: 700px;
  width: 80%;
  margin: auto;
`

function App() {
    const {register, handleSubmit} = useForm();
    const [state, setState] = useState({});

    const onSubmit = (val) => {
        const donor = allelesFromInput(val['donor']), recipient = allelesFromInput(val['recipient']);
        const results = determineUsableAntibodies(donor, recipient);
        setState(results);
    };

    const getAlleleForAntibody = (antibody, personMap) => {
        const antibodyToAlleles = Object.fromEntries(Object.entries(personMap).map(([k, v]) => [v, k]));
        return antibodyToAlleles[antibody];
    }

    const hasAvailableAntibodies = (person) => {
        return person && person.available && (person.available.length > 0)
    }

    const matchType = (donor, recipient) => {
        const donorAvailable = hasAvailableAntibodies(donor)
        const recipientAvailable = hasAvailableAntibodies(recipient)

        if (donorAvailable && recipientAvailable) {
            return 'Full'
        } else if (donorAvailable || recipientAvailable) {
            return 'Partial'
        } else {
            return false;
        }
    }

    const getAvailableAntibodiesWithAlleles = ({available, antibodies}) => {
        return available
            .map(antibody => [antibody, getAlleleForAntibody(antibody, antibodies)])
            .map(([antibody, allele]) => `${antibody} (for ${allele})`)
            .join(", ")
    }

    const match = matchType(state.donor, state.recipient);

    return (
        <AppContainer>
            <h1> HLA Antibody Mismatch Identification </h1>
            <HLATypingForm onSubmit={handleSubmit(onSubmit)}>
                <InputContainer>
                    <Label>
                        Recipient
                    </Label>
                    <Input name='recipient' ref={register}/>
                </InputContainer>
                <InputContainer>
                    <Label>
                        Donor
                    </Label>
                    <Input name='donor' ref={register}/>
                </InputContainer>
                <div>
                    <Button> Submit</Button>
                </div>
            </HLATypingForm>

            {state.donor && <Results>

                <MatchStatus match={!!match}>
                    {!match && "No mismatch!"}
                    {!!match && `${match} mismatch!`}
                </MatchStatus>

                <br/>

                {(!hasAvailableAntibodies(state.donor) && !hasAvailableAntibodies(state.recipient)) &&
                <div>
                    No available antibodies would uniquely identify either person
                </div>}

                {hasAvailableAntibodies(state.donor) && <div>
                    Use <Antibodies>{getAvailableAntibodiesWithAlleles(state.donor)}</Antibodies> to identify the Donor
                </div>}

                {(hasAvailableAntibodies(state.donor) && !hasAvailableAntibodies(state.recipient)) && <div>
                    No available antibodies would uniquely identify the Recipient
                </div>}

                {hasAvailableAntibodies(state.recipient) && <div>
                    Use <Antibodies>{getAvailableAntibodiesWithAlleles(state.recipient)}</Antibodies> to identify the Recipient
                </div>}

                {(!hasAvailableAntibodies(state.donor) && hasAvailableAntibodies(state.recipient)) && <div>
                    No available antibodies would uniquely identify the Donor
                </div>}
            </Results>}
        </AppContainer>
    );
}

export default App;
