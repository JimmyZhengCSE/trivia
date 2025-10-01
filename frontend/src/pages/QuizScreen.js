import Quiz from '../components/Quiz';
import { HomeButton } from '../components/Buttons';

export default function QuizScreen( {questions}) {
    return (
        <div>
            <Quiz questions={questions} inCoop={false}/>
            <HomeButton />
        </div>
    );
}
