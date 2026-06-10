import {
    View,
    Text,
    Image,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const HERO_HEIGHT = height * 0.5;
const CURVE_OVERLAP = height * 0.08;
const WHITE_HEIGHT = height - (HERO_HEIGHT - CURVE_OVERLAP);

function WhiteShape() {
    return (
        <Svg
            width={width}
            height={WHITE_HEIGHT}
            viewBox={`0 0 393 536`}
            preserveAspectRatio="none"
            style={{
                position: 'absolute',
                zIndex: 20,
                top: HERO_HEIGHT - CURVE_OVERLAP,
            }}
        >
            <Path
                d="M198.248 45.5741C330.048 148.116 393 45.5741 393 45.5741V535.717H0V45.5741C0 45.5741 66.4475 -56.9677 198.248 45.5741Z"
                fill="white"
            />
        </Svg>
    );
}
export default function LoginTwo() {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Image
                source={require('../assets/images/splash.png')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['rgba(124,58,237,0.45)', 'rgba(124,58,237,0.45)']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.headerContent}>
                <View style={styles.logoCard}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.signInTitle}>Sign In</Text>
                <Text style={styles.signInSubtitle}>LECO WORKFORCE</Text>
            </View>

            <WhiteShape />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    headerContent: {
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '15%',
    },
    logoCard: {
        width: 110,
        height: 110,
        borderRadius: 110,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
    },
    logo: {
        width: '75%',
        height: '75%',
    },
    signInTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5,
        marginBottom: 5,
    },
    signInSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: 3,
        fontWeight: '500',
    },
});