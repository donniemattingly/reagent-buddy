import React, {useState} from 'react';
import {useForm} from 'react-hook-form'
import './App.css';

const antibodyToAllelesMap = {
    'A2': ['A203', 'A210'],
    'A9': ['A23', 'A24', 'A2403'],
    'B8': [],
    'B27': ['B2708'],
    'B12': ['B44', 'B45'],
    'A3': [],
    'B7': ['B703'],
    'Bw4': ['B5', 'B5102', 'B5103', 'B13', 'B17', 'B27', 'B37', 'B38', 'B16', 'B44', 'B12', 'B47', 'B49', 'B51', 'B5', 'B52', 'B5', 'B53', 'B57', 'B17', '17', 'B58', 'B17', 'B59', 'B63', 'B15', 'B77', 'B15', 'A9', 'A23', 'A9', 'A24', 'A9', 'A2403', 'A25', 'A10', 'A32', 'A19'],
    'Bw6': ['B7', 'B703', 'B8', 'B14', 'B18', 'B22', 'B2708', 'B35', 'B39', 'B16', 'B3901', 'B3902', 'B40', 'B4005', 'B41', 'B42', 'B45', 'B12', 'B46', 'B48', 'B50', 'B21', 'B54', 'B22', 'B55', 'B22', 'B56', 'B22', 'B60', 'B40', 'B61', 'B40', 'B62', 'B15', 'B64', 'B14', 'B65', 'B14', 'B67', 'B70', 'B71', 'B70', 'B72', 'B70', 'B73', 'B75', 'B15', 'B76', 'B15', 'B78', 'B81', 'B82'],
};

const allelesToAntibodiesMap = Object.fromEntries(
    Object.keys(antibodyToAllelesMap)
        .flatMap(i => antibodyToAllelesMap[i].map(j => [j, i])));

const allelesFromInput = (input) => input.split(',').map(it => it.trim());

const hydrateAlleleWithAntibodyMatch = allele => ({allele, antibody: allelesToAntibodiesMap[allele]});

const getAntibodiesForAlleles = (donor, recipient) => [
    {d: donor[0], r: recipient[0]},
    {d: donor[1], r: recipient[0]},
    {d: donor[0], r: recipient[1]},
    {d: donor[1], r: recipient[1]},
].map(({d, r}) => ({
    d: hydrateAlleleWithAntibodyMatch(d), r: hydrateAlleleWithAntibodyMatch(r)
})).filter(({d, r}) => d.antibody !== r.antibody);

function App() {
    const {register, handleSubmit} = useForm();
    const [antibodies, setAntibodies] = useState();
    const [donor, setDonor] = useState();
    const [recipient, setRecipient] = useState();

    const onSubmit = (val) => {
        const donor = allelesFromInput(val['donor']), recipient = allelesFromInput(val['recipient']);
        setDonor(donor);
        setRecipient(recipient);
        setAntibodies(getAntibodiesForAlleles(donor, recipient));
    };

    return (
        <div className="App">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>
                    Donor
                </label>
                <input name='donor' ref={register}/>
                <label>
                    Recipient
                </label>
                <input name='recipient' ref={register}/>
                <button> Submit</button>
            </form>
            {donor && <div>
                Donor Antibodies:
                {donor.map(hydrateAlleleWithAntibodyMatch).map(d => <div>
                    {d.allele} : {d.antibody}
                </div>)}
            </div>}
            <br/>
            {recipient && <div>
                Recipient Antibodies:
                {recipient.map(hydrateAlleleWithAntibodyMatch).map(d => <div>
                    {d.allele} : {d.antibody}
                </div>)}
            </div>}
            <br/>
            {antibodies && <div>
                {antibodies.map(antibody => <div>
                    Mismatch at Donor: {antibody.d.allele} (use {antibody.d.antibody}) and Recipient: {antibody.r.allele} (use {antibody.r.antibody})
                </div>)}
            </div>}
        </div>
    );
}

export default App;
