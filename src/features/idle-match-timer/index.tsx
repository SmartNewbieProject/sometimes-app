import { View, StyleSheet } from 'react-native';
import { useAuth } from '../auth';
import { useLatestMatching } from './queries';
import Loading from '../loading';
import { Waiting } from './ui';
import { Partner } from './ui/partner';
import { NotFound } from './ui/not-found';
import { Container } from './ui/container';
import { InteractionNavigation } from './ui/nav';
import { useState } from 'react';
import { RematchLoading } from './ui/rematching';

export default function IdleMatchTimer() {
  const { match, isLoading: matchLoading, refetch } = useLatestMatching();
  const { my } = useAuth();
  const [isRematching, setIsRematching] = useState(false);

  const isOpen = match?.type ? ['open', 'rematching'].includes(match.type) : false;

  const loading = (() => {
    if (!my || !match || matchLoading) return true;
    return false;
  })();

  if (isRematching) {
    return <RematchLoading />;
  }

  return (
    <View>
      <View style={styles.container}>
        <Loading.Lottie
          title="불러오고 있어요"
          loading={loading}
        >
          <Container
            gradientMode={['not-found', 'waiting'].includes(match?.type as string)}
          >
            {match?.type === 'not-found' && <NotFound />}
            {isOpen && <Partner match={match!} />}
            {match?.type === 'waiting' && <Waiting match={match!} onTimeEnd={refetch} />}
            {/* <Waiting match={match!} onTimeEnd={onTimeEnd} /> */}
          </Container>
        </Loading.Lottie>
      </View>
      {match && <InteractionNavigation match={match} setRematching={setIsRematching} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  previousContainer: {
    position: 'absolute',
    width: 72,
    flexDirection: 'column',
    backgroundColor: '#ECE5FF',
    height: 128,
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    right: 0,
    top: 0,
  },
  previousButton: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    height: 112,
  },
  topRadius: {
    borderBottomRightRadius: 16,
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
    backgroundColor: '#ECE5FF',
  },
  bottomRadius: {
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
    backgroundColor: '#e6ddff',
  },
});
