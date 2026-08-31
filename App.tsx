import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";

/* --------------------------------------------------------------------------
   ASHLEY — « TECHNO DOLL »
   Site officiel / application de l'artiste Ashley (@ashley.musicoff).
   Hard techno · « Escape the mind, Enter the rave »
   Direction artistique : lumineux, hyperpop-chrome, énergie rave.
   -------------------------------------------------------------------------- */

const C = {
  ink: "#1b1030",
  night: "#2a1650",
  muted: "#8a7bb0",
  soft: "#b9aede",
  pink: "#ff2e93",
  magenta: "#ff4fb2",
  violet: "#7b3cff",
  cyan: "#22e3e3",
  lilac: "#f4ebff",
  petal: "#ffe9f6",
  paper: "#fbf6ff",
  cloud: "#ffffff",
  line: "#ece0fb",
  glass: "rgba(123,60,255,0.08)",
  white: "#fff",
};

const IG = "https://www.instagram.com/ashley.musicoff/";
const TIKTOK = "https://www.tiktok.com/@ashley.musicoff";
const SPOTIFY = "https://open.spotify.com/artist/0JbsjL74YqmrAZuImwy8FZ";
const SOUNDCLOUD = "https://soundcloud.com/skorm888";
const LINKTREE = "https://linktr.ee/ashley.musicoff";
// Liens routés vers le Linktree officiel tant que l'URL directe n'est pas fournie.
const APPLE = LINKTREE;
const YOUTUBE = LINKTREE;
const BOOKING = "ashley.booking.music@gmail.com";
const SLOGAN = "Escape the mind, Enter the rave";
const ALIAS = "SKORM";

type Lib = "fa" | "ion" | "feather";
type PlatformLink = {
  label: string;
  lib: Lib;
  icon: string;
  url: string;
  colors: [string, string];
};

const PLATFORMS: PlatformLink[] = [
  { label: "Spotify", lib: "fa", icon: "spotify", url: SPOTIFY, colors: ["#1DB954", "#14833B"] },
  { label: "SoundCloud", lib: "ion", icon: "logo-soundcloud", url: SOUNDCLOUD, colors: ["#FF7A00", "#FF3D00"] },
  { label: "Apple Music", lib: "ion", icon: "logo-apple", url: APPLE, colors: ["#FB5C74", "#FA2D6F"] },
  { label: "YouTube", lib: "ion", icon: "logo-youtube", url: YOUTUBE, colors: ["#FF3B3B", "#CC0000"] },
  { label: "TikTok", lib: "ion", icon: "logo-tiktok", url: TIKTOK, colors: [C.night, C.ink] },
  { label: "Instagram", lib: "ion", icon: "logo-instagram", url: IG, colors: [C.pink, C.violet] },
];

function PlatIcon({ p, size = 20, color = "#fff" }: { p: PlatformLink; size?: number; color?: string }) {
  if (p.lib === "fa") return <FontAwesome name={p.icon as any} size={size} color={color} />;
  if (p.lib === "feather") return <Feather name={p.icon as any} size={size} color={color} />;
  return <Ionicons name={p.icon as any} size={size} color={color} />;
}

const openURL = (url: string) => Linking.openURL(url).catch(() => {});

const buzz = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) => {
  if (Platform.OS !== "web") Haptics.impactAsync(style).catch(() => {});
};

// Grille de plateformes cliquables
function PlatformGrid() {
  return (
    <View style={st.platGrid}>
      {PLATFORMS.map((p) => (
        <Pressable
          key={p.label}
          style={st.platCell}
          onPress={() => {
            buzz();
            openURL(p.url);
          }}
        >
          <LinearGradient
            colors={p.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.platIcon}
          >
            <PlatIcon p={p} />
          </LinearGradient>
          <Text style={st.platLabel}>{p.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Rangée horizontale compacte de plateformes
function PlatformRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 18 }}
    >
      {PLATFORMS.map((p) => (
        <Pressable
          key={p.label}
          style={st.platPill}
          onPress={() => {
            buzz();
            openURL(p.url);
          }}
        >
          <LinearGradient
            colors={p.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.platPillIcon}
          >
            <PlatIcon p={p} size={15} />
          </LinearGradient>
          <Text style={st.platPillText}>{p.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

type Track = {
  id: string;
  title: string;
  kind: "Single" | "EP" | "Remix" | "Édit";
  bpm: number;
  year: string;
  length: string;
  color: [string, string];
  art: string;
  tag: string;
  fresh?: boolean;
};

type MixSet = {
  id: string;
  title: string;
  venue: string;
  length: string;
  plays: string;
  art: string;
  color: [string, string];
};

type Show = {
  id: string;
  date: string;
  day: string;
  city: string;
  country: string;
  venue: string;
  status: "Billets" | "Complet" | "Bientôt";
};

/* ------------------------------ Contenu ---------------------------------- */

const TRACKS: Track[] = [
  {
    id: "t0",
    title: "UNO DOS TRES",
    kind: "Single",
    bpm: 150,
    year: "2026",
    length: "5:36",
    color: [C.pink, C.cyan],
    art: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=900&q=90",
    tag: "Acid techno",
    fresh: true,
  },
  {
    id: "t1",
    title: "DOLL MACHINE",
    kind: "Single",
    bpm: 152,
    year: "2026",
    length: "5:42",
    color: [C.pink, C.violet],
    art: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&q=90",
    tag: "Hard techno",
    fresh: true,
  },
  {
    id: "t2",
    title: "NEON CATHEDRAL",
    kind: "Single",
    bpm: 150,
    year: "2026",
    length: "6:10",
    color: [C.violet, C.cyan],
    art: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=90",
    tag: "Hard groove",
    fresh: true,
  },
  {
    id: "t3",
    title: "ACID BARBIE",
    kind: "Single",
    bpm: 156,
    year: "2025",
    length: "5:28",
    color: [C.magenta, C.pink],
    art: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=90",
    tag: "Acid rave",
  },
  {
    id: "t4",
    title: "HYPERDRIVE",
    kind: "EP",
    bpm: 158,
    year: "2025",
    length: "5:55",
    color: [C.cyan, C.violet],
    art: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=90",
    tag: "Hard techno",
  },
  {
    id: "t5",
    title: "PVC HEART",
    kind: "Single",
    bpm: 148,
    year: "2025",
    length: "5:12",
    color: [C.pink, C.cyan],
    art: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=900&q=90",
    tag: "Rave",
  },
  {
    id: "t6",
    title: "CHROME TEARS",
    kind: "Remix",
    bpm: 150,
    year: "2025",
    length: "6:04",
    color: [C.violet, C.magenta],
    art: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900&q=90",
    tag: "Hard rework",
  },
  {
    id: "t7",
    title: "RAVE DOLL",
    kind: "Single",
    bpm: 154,
    year: "2024",
    length: "5:34",
    color: [C.magenta, C.violet],
    art: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=900&q=90",
    tag: "Rave anthem",
  },
  {
    id: "t8",
    title: "OVERDRIVE — Club Édit",
    kind: "Édit",
    bpm: 160,
    year: "2024",
    length: "5:48",
    color: [C.cyan, C.pink],
    art: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=900&q=90",
    tag: "Hard techno",
  },
];

const MIXES: MixSet[] = [
  {
    id: "m1",
    title: "TECHNO DOLL — Warehouse 001",
    venue: "Live set · 62 min",
    length: "62:00",
    plays: "48k",
    art: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=900&q=90",
    color: [C.pink, C.violet],
  },
  {
    id: "m2",
    title: "Sunrise B2B — Open Air",
    venue: "Live set · 74 min",
    length: "74:00",
    plays: "31k",
    art: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=90",
    color: [C.cyan, C.violet],
  },
  {
    id: "m3",
    title: "Peak Time Podcast #12",
    venue: "Studio mix · 58 min",
    length: "58:00",
    plays: "22k",
    art: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&q=90",
    color: [C.magenta, C.pink],
  },
];

const SHOWS: Show[] = [
  {
    id: "s1",
    date: "12",
    day: "SEP",
    city: "Paris",
    country: "FR",
    venue: "La Machine du Moulin Rouge",
    status: "Billets",
  },
  {
    id: "s2",
    date: "26",
    day: "SEP",
    city: "Berlin",
    country: "DE",
    venue: "RSO Berlin",
    status: "Billets",
  },
  {
    id: "s3",
    date: "10",
    day: "OCT",
    city: "Amsterdam",
    country: "NL",
    venue: "Shelter — ADE",
    status: "Complet",
  },
  {
    id: "s4",
    date: "24",
    day: "OCT",
    city: "London",
    country: "UK",
    venue: "FOLD",
    status: "Billets",
  },
  {
    id: "s5",
    date: "15",
    day: "NOV",
    city: "Barcelona",
    country: "ES",
    venue: "Input High Fidelity",
    status: "Bientôt",
  },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&q=90",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&q=90",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=90",
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=700&q=90",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=700&q=90",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=700&q=90",
];

/* ------------------------- Lecteur audio global -------------------------- */

type PlayerState = {
  current: Track | null;
  playing: boolean;
  progress: number; // 0..1
  play: (t: Track) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  open: () => void;
  liked: Set<string>;
  like: (id: string) => void;
};

const Player = createContext<PlayerState>({
  current: null,
  playing: false,
  progress: 0,
  play: () => {},
  toggle: () => {},
  next: () => {},
  prev: () => {},
  open: () => {},
  liked: new Set(),
  like: () => {},
});
const usePlayer = () => useContext(Player);

/* ------------------------------ Composants ------------------------------- */

function Equalizer({ on, tint = C.white, size = 3 }: { on: boolean; tint?: string; size?: number }) {
  const bars = useRef([0, 1, 2, 3].map(() => new Animated.Value(0.35))).current;
  useEffect(() => {
    const loops = bars.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 320 + i * 90,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(v, {
            toValue: 0.3,
            duration: 300 + i * 80,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    if (on) loops.forEach((l) => l.start());
    else bars.forEach((v) => v.setValue(0.35));
    return () => loops.forEach((l) => l.stop());
  }, [on]);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 16 }}>
      {bars.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: size,
            borderRadius: 2,
            backgroundColor: tint,
            height: v.interpolate({ inputRange: [0, 1], outputRange: [4, 16] }),
          }}
        />
      ))}
    </View>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={st.logoDot}>
        <LinearGradient
          colors={[C.pink, C.violet, C.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <Text style={[st.logoText, small && { fontSize: 15 }]}>ASHLEY</Text>
    </View>
  );
}

function TopBar({ title, sub }: { title?: string; sub?: string }) {
  return (
    <View style={st.topBar}>
      <View>
        {title ? (
          <>
            <Text style={st.topKicker}>{sub}</Text>
            <Text style={st.topTitle}>{title}</Text>
          </>
        ) : (
          <Logo />
        )}
      </View>
      <Pressable
        style={st.igBtn}
        onPress={() => {
          buzz();
          openURL(IG);
        }}
      >
        <Feather name="instagram" size={16} color={C.white} />
      </Pressable>
    </View>
  );
}

function GlowButton({
  label,
  icon,
  onPress,
  soft = false,
}: {
  label: string;
  icon?: any;
  onPress?: () => void;
  soft?: boolean;
}) {
  if (soft)
    return (
      <Pressable style={st.softBtn} onPress={onPress}>
        {icon && <Ionicons name={icon} size={16} color={C.violet} />}
        <Text style={st.softBtnText}>{label}</Text>
      </Pressable>
    );
  return (
    <Pressable onPress={onPress} style={st.glowWrap}>
      <LinearGradient
        colors={[C.pink, C.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.glowBtn}
      >
        {icon && <Ionicons name={icon} size={17} color={C.white} />}
        <Text style={st.glowText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SectionTitle({ label, title, action }: { label: string; title: string; action?: string }) {
  return (
    <View style={st.sectionHead}>
      <View>
        <Text style={st.sectionLabel}>{label}</Text>
        <Text style={st.sectionTitle}>{title}</Text>
      </View>
      {action && <Text style={st.sectionAction}>{action}</Text>}
    </View>
  );
}

function TrackRow({ track, index }: { track: Track; index: number }) {
  const { current, playing, play } = usePlayer();
  const active = current?.id === track.id;
  return (
    <Pressable
      style={[st.trackRow, active && st.trackRowOn]}
      onPress={() => {
        buzz();
        play(track);
      }}
    >
      <View style={st.trackArtWrap}>
        <Image source={{ uri: track.art }} style={st.trackArt} />
        <View style={st.trackArtVeil}>
          {active && playing ? (
            <Equalizer on tint={C.white} />
          ) : (
            <Ionicons name="play" size={16} color={C.white} />
          )}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[st.trackTitle, active && { color: C.violet }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={st.trackMeta}>
          {track.kind} · {track.bpm} BPM · {track.tag}
        </Text>
      </View>
      {track.fresh && (
        <View style={st.freshTag}>
          <Text style={st.freshText}>NEW</Text>
        </View>
      )}
      <Text style={st.trackLen}>{track.length}</Text>
    </Pressable>
  );
}

/* -------------------------------- Écrans --------------------------------- */

function Home({ navigation }: any) {
  const { play } = usePlayer();
  const hero = TRACKS[0];
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* HERO */}
        <View style={st.hero}>
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1000&q=90",
            }}
            style={st.heroImg}
            imageStyle={{ borderRadius: 30 }}
          >
            <LinearGradient
              colors={["rgba(255,46,147,0.20)", "rgba(123,60,255,0.62)"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 30 }]}
            />
            <View style={st.heroTop}>
              <View style={st.livePill}>
                <View style={st.liveDot} />
                <Text style={st.livePillText}>TECHNO DOLL</Text>
              </View>
            </View>
            <View style={st.heroBottom}>
              <Text style={st.heroGenre}>HARD TECHNO</Text>
              <Text style={st.heroName}>ASHLEY</Text>
              <Text style={st.heroSlogan}>« {SLOGAN} »</Text>
              <View style={st.heroBtns}>
                <GlowButton
                  label="Écouter maintenant"
                  icon="play"
                  onPress={() => {
                    buzz(Haptics.ImpactFeedbackStyle.Medium);
                    play(hero);
                    navigation.navigate("NowPlaying");
                  }}
                />
                <Pressable
                  style={st.heroGhost}
                  onPress={() => navigation.navigate("Tabs", { screen: "Live" })}
                >
                  <Text style={st.heroGhostText}>Dates live</Text>
                </Pressable>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* STATS */}
        <View style={st.stats}>
          {[
            ["24k", "Abonnés"],
            ["8", "Titres"],
            ["120+", "Dates"],
          ].map(([n, l]) => (
            <View key={l} style={st.stat}>
              <Text style={st.statNum}>{n}</Text>
              <Text style={st.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* SLOGAN */}
        <View style={st.sloganBand}>
          <LinearGradient
            colors={[C.pink, C.violet, C.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={st.sloganText}>{SLOGAN.toUpperCase()}</Text>
        </View>

        {/* DERNIÈRE SORTIE */}
        <SectionTitle label="À LA UNE" title="Dernière sortie" />
        <Pressable
          style={st.featureCard}
          onPress={() => {
            buzz();
            play(hero);
            navigation.navigate("NowPlaying");
          }}
        >
          <LinearGradient
            colors={hero.color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.featureGlow}
          />
          <Image source={{ uri: hero.art }} style={st.featureArt} />
          <View style={{ flex: 1 }}>
            <Text style={st.featureKind}>{hero.kind} · {hero.year}</Text>
            <Text style={st.featureTitle}>{hero.title}</Text>
            <Text style={st.featureMeta}>
              {hero.bpm} BPM · {hero.length}
            </Text>
            <View style={st.featurePlay}>
              <Ionicons name="play" size={13} color={C.white} />
              <Text style={st.featurePlayText}>Lecture</Text>
            </View>
          </View>
        </Pressable>

        {/* SONS */}
        <SectionTitle
          label="LES SONS"
          title="Titres phares"
          action="Tout voir"
        />
        <View style={st.list}>
          {TRACKS.slice(0, 4).map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} />
          ))}
        </View>
        <View style={{ paddingHorizontal: 18, marginTop: 12 }}>
          <GlowButton
            label="Ouvrir la discographie"
            icon="disc"
            soft
            onPress={() => navigation.navigate("Tabs", { screen: "Sons" })}
          />
        </View>

        {/* PLATEFORMES */}
        <SectionTitle label="STREAMING" title="Écouter partout" action="SKORM" />
        <PlatformRow />
        <View style={{ paddingHorizontal: 18, marginTop: 12 }}>
          <GlowButton
            label="Tous les liens"
            icon="link"
            soft
            onPress={() => openURL(LINKTREE)}
          />
        </View>

        {/* MIXES */}
        <SectionTitle label="EN LIVE" title="Sets & mixes" action="Écouter" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 14 }}
        >
          {MIXES.map((m) => (
            <Pressable key={m.id} style={st.mixCard} onPress={() => openURL(IG)}>
              <ImageBackground
                source={{ uri: m.art }}
                style={st.mixImg}
                imageStyle={{ borderRadius: 22 }}
              >
                <LinearGradient
                  colors={["transparent", "rgba(27,16,48,0.82)"]}
                  style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
                />
                <View style={st.mixPlay}>
                  <Ionicons name="headset" size={16} color={C.white} />
                </View>
                <View style={st.mixInfo}>
                  <Text style={st.mixTitle} numberOfLines={2}>
                    {m.title}
                  </Text>
                  <Text style={st.mixMeta}>
                    {m.venue} · {m.plays} écoutes
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>

        {/* PROCHAINE DATE */}
        <SectionTitle label="PROCHAINE DATE" title="On se voit où ?" />
        <View style={{ paddingHorizontal: 18 }}>
          <ShowRow show={SHOWS[0]} first />
          <View style={{ marginTop: 12 }}>
            <GlowButton
              label="Voir toutes les dates"
              icon="calendar"
              soft
              onPress={() => navigation.navigate("Tabs", { screen: "Live" })}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Sons() {
  const [filter, setFilter] = useState<string>("Tout");
  const filters = ["Tout", "Single", "EP", "Remix", "Édit"];
  const list = filter === "Tout" ? TRACKS : TRACKS.filter((t) => t.kind === filter);
  const { play, open } = usePlayer();
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <TopBar title="Les sons" sub="DISCOGRAPHIE" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={st.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
            {filters.map((f) => {
              const on = f === filter;
              return (
                <Pressable
                  key={f}
                  onPress={() => {
                    buzz();
                    setFilter(f);
                  }}
                  style={[st.chip, on && st.chipOn]}
                >
                  <Text style={[st.chipText, on && st.chipTextOn]}>{f}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Pressable
          style={st.shuffle}
          onPress={() => {
            buzz(Haptics.ImpactFeedbackStyle.Medium);
            play(list[Math.floor(Math.random() * list.length)]);
            open();
          }}
        >
          <LinearGradient
            colors={[C.cyan, C.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.shuffleGrad}
          >
            <Ionicons name="shuffle" size={18} color={C.white} />
            <Text style={st.shuffleText}>Lecture aléatoire</Text>
          </LinearGradient>
        </Pressable>

        <View style={[st.list, { marginTop: 6 }]}>
          {list.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} />
          ))}
        </View>

        <View style={st.streamCard}>
          <Text style={st.streamTitle}>Écouter partout</Text>
          <Text style={st.streamSub}>
            Sorties &amp; sets d'ASHLEY (alias {ALIAS}) sur toutes les plateformes.
          </Text>
          <View style={{ alignSelf: "stretch" }}>
            <PlatformGrid />
          </View>
          <View style={{ alignSelf: "stretch", marginTop: 6 }}>
            <GlowButton label="Tous les liens" icon="link" onPress={() => openURL(LINKTREE)} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ShowRow({ show, first = false }: { show: Show; first?: boolean }) {
  const soldout = show.status === "Complet";
  const soon = show.status === "Bientôt";
  return (
    <View style={[st.showRow, first && st.showRowFirst]}>
      <View style={st.showDate}>
        <Text style={st.showDay}>{show.date}</Text>
        <Text style={st.showMonth}>{show.day}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.showCity}>
          {show.city} <Text style={st.showCountry}>· {show.country}</Text>
        </Text>
        <Text style={st.showVenue}>{show.venue}</Text>
      </View>
      <Pressable
        style={[
          st.ticket,
          soldout && st.ticketOff,
          soon && st.ticketSoon,
        ]}
        onPress={() => {
          if (!soldout) {
            buzz();
            openURL(IG);
          }
        }}
      >
        <Text
          style={[
            st.ticketText,
            soldout && { color: C.muted },
            soon && { color: C.violet },
          ]}
        >
          {show.status}
        </Text>
      </Pressable>
    </View>
  );
}

function Live() {
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <TopBar title="En live" sub="TOUR 2026" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1000&q=90",
          }}
          style={st.liveHero}
          imageStyle={{ borderRadius: 26 }}
        >
          <LinearGradient
            colors={["rgba(34,227,227,0.25)", "rgba(123,60,255,0.72)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 26 }]}
          />
          <Text style={st.liveHeroKicker}>HARD TECHNO TOUR</Text>
          <Text style={st.liveHeroTitle}>Clubs, warehouses{"\n"}& open airs</Text>
          <Text style={st.liveHeroSlogan}>« {SLOGAN} »</Text>
        </ImageBackground>

        <View style={{ paddingHorizontal: 18, marginTop: 8 }}>
          {SHOWS.map((sh, i) => (
            <ShowRow key={sh.id} show={sh} first={i === 0} />
          ))}
        </View>

        <View style={st.bookCard}>
          <View style={st.bookIcon}>
            <Ionicons name="sparkles" size={18} color={C.white} />
          </View>
          <Text style={st.bookTitle}>Bookez ASHLEY</Text>
          <Text style={st.bookSub}>
            Club, festival, marque ou soirée privée — parlons-en.
          </Text>
          <GlowButton
            label="Demande de booking"
            icon="mail"
            onPress={() => openURL(`mailto:${BOOKING}?subject=Booking%20ASHLEY`)}
          />
          <Text style={st.bookMail}>{BOOKING}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Galerie() {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <TopBar title="Galerie" sub="BACKSTAGE & CLUB" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={st.masonry}>
          {GALLERY.map((uri, i) => (
            <Pressable
              key={i}
              onPress={() => openURL(IG)}
              style={[st.tile, i % 3 === 0 ? st.tileTall : st.tileShort]}
            >
              <Image source={{ uri }} style={st.tileImg} />
              <LinearGradient
                colors={["transparent", "rgba(27,16,48,0.5)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              />
            </Pressable>
          ))}
        </View>
        <View style={{ paddingHorizontal: 18, marginTop: 8 }}>
          <GlowButton
            label="Plus de photos sur Instagram"
            icon="logo-instagram"
            soft
            onPress={() => openURL(IG)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const send = () => {
    buzz(Haptics.ImpactFeedbackStyle.Medium);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    openURL(`mailto:${BOOKING}?subject=Contact%20ASHLEY&body=${body}`);
  };
  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <TopBar title="Contact" sub="BOOKING & PRESSE" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={st.contactHero}>
          <View style={st.contactAvatar}>
            <LinearGradient
              colors={[C.pink, C.violet, C.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={st.contactInitial}>A</Text>
          </View>
          <Text style={st.contactName}>ASHLEY</Text>
          <Text style={st.contactAlias}>aka {ALIAS}</Text>
          <Text style={st.contactRole}>Hard Techno · DJ &amp; Productrice</Text>
          <Text style={st.contactSlogan}>« {SLOGAN} »</Text>
        </View>

        {/* Bulle contact : e-mail booking direct */}
        <Pressable
          style={st.mailBubble}
          onPress={() => {
            buzz();
            openURL(`mailto:${BOOKING}?subject=Contact%20ASHLEY`);
          }}
        >
          <View style={st.mailBubbleIcon}>
            <Feather name="mail" size={18} color={C.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.mailBubbleLabel}>Booking &amp; presse</Text>
            <Text style={st.mailBubbleMail}>{BOOKING}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={C.muted} />
        </Pressable>

        {/* Toutes les plateformes */}
        <SectionTitle label="RETROUVE ASHLEY" title="Sur chaque plateforme" action={ALIAS} />
        <PlatformGrid />
        <View style={{ paddingHorizontal: 18, marginTop: 12 }}>
          <GlowButton label="Tous les liens" icon="link" onPress={() => openURL(LINKTREE)} />
        </View>

        <View style={st.form}>
          <Text style={st.formTitle}>Un message direct ?</Text>
          <Text style={st.formLabel}>Ton nom</Text>
          <TextInput
            style={st.input}
            placeholder="Nom / structure"
            placeholderTextColor={C.soft}
            value={name}
            onChangeText={setName}
          />
          <Text style={st.formLabel}>Email</Text>
          <TextInput
            style={st.input}
            placeholder="toi@email.com"
            placeholderTextColor={C.soft}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={st.formLabel}>Message</Text>
          <TextInput
            style={[st.input, st.inputArea]}
            placeholder="Date, lieu, budget, détails…"
            placeholderTextColor={C.soft}
            multiline
            value={msg}
            onChangeText={setMsg}
          />
          <View style={{ marginTop: 8 }}>
            <GlowButton label="Envoyer la demande" icon="send" onPress={send} />
          </View>
          <Text style={st.formMail}>{BOOKING}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------- Lecteur plein écran ------------------------- */

function NowPlaying({ navigation }: any) {
  const { current, playing, toggle, next, prev, progress, liked, like } = usePlayer();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (playing) {
      loop = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
    }
    return () => loop?.stop();
  }, [playing]);
  if (!current)
    return (
      <SafeAreaView style={[st.safe, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: C.muted }}>Aucun titre en lecture</Text>
      </SafeAreaView>
    );
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const isLiked = liked.has(current.id);
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[current.color[0], current.color[1], C.paper]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={st.npBar}>
          <Pressable onPress={() => navigation.goBack()} style={st.npClose}>
            <Ionicons name="chevron-down" size={24} color={C.white} />
          </Pressable>
          <Text style={st.npBarText}>EN LECTURE</Text>
          <Pressable onPress={() => openURL(IG)} style={st.npClose}>
            <Feather name="share" size={18} color={C.white} />
          </Pressable>
        </View>

        <View style={st.npArtWrap}>
          <Animated.View style={[st.npDisc, { transform: [{ rotate }] }]}>
            <Image source={{ uri: current.art }} style={st.npArt} />
            <View style={st.npHole} />
          </Animated.View>
        </View>

        <View style={st.npInfo}>
          <Text style={st.npTitle}>{current.title}</Text>
          <Text style={st.npArtist}>ASHLEY · {current.tag}</Text>
        </View>

        <View style={st.npProgress}>
          <View style={st.npTrack}>
            <View style={[st.npFill, { width: `${Math.round(progress * 100)}%` }]} />
            <View style={[st.npKnob, { left: `${Math.round(progress * 100)}%` }]} />
          </View>
          <View style={st.npTimes}>
            <Text style={st.npTime}>
              {fmt(progress * dur(current.length))}
            </Text>
            <Text style={st.npTime}>{current.length}</Text>
          </View>
        </View>

        <View style={st.npControls}>
          <Pressable onPress={() => like(current.id)}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={26}
              color={isLiked ? C.pink : C.white}
            />
          </Pressable>
          <Pressable onPress={() => { buzz(); prev(); }}>
            <Ionicons name="play-skip-back" size={30} color={C.white} />
          </Pressable>
          <Pressable
            onPress={() => {
              buzz(Haptics.ImpactFeedbackStyle.Medium);
              toggle();
            }}
            style={st.npPlay}
          >
            <Ionicons name={playing ? "pause" : "play"} size={32} color={current.color[1]} />
          </Pressable>
          <Pressable onPress={() => { buzz(); next(); }}>
            <Ionicons name="play-skip-forward" size={30} color={C.white} />
          </Pressable>
          <Pressable onPress={() => openURL(IG)}>
            <Feather name="instagram" size={24} color={C.white} />
          </Pressable>
        </View>

        <Pressable style={st.npStream} onPress={() => openURL(IG)}>
          <Ionicons name="logo-instagram" size={16} color={C.white} />
          <Text style={st.npStreamText}>Écouter la version complète</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const dur = (s: string) => {
  const [m, sec] = s.split(":").map(Number);
  return m * 60 + sec;
};
const fmt = (total: number) => {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/* ------------------------------ Mini-player ------------------------------ */

function MiniPlayer({ navigation }: any) {
  const { current, playing, toggle } = usePlayer();
  if (!current) return null;
  return (
    <Pressable style={st.mini} onPress={() => navigation.navigate("NowPlaying")}>
      <LinearGradient
        colors={current.color}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Image source={{ uri: current.art }} style={st.miniArt} />
      <View style={{ flex: 1 }}>
        <Text style={st.miniTitle} numberOfLines={1}>
          {current.title}
        </Text>
        <Text style={st.miniArtist}>ASHLEY</Text>
      </View>
      {playing && <Equalizer on tint={C.white} />}
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          buzz();
          toggle();
        }}
        style={st.miniPlay}
      >
        <Ionicons name={playing ? "pause" : "play"} size={18} color={C.white} />
      </Pressable>
    </Pressable>
  );
}

/* ------------------------------- Tab bar --------------------------------- */

function DollTabBar({ state, navigation }: any) {
  const icons: any = {
    Accueil: "home",
    Sons: "musical-notes",
    Live: "calendar",
    Galerie: "images",
    Contact: "mail",
  };
  return (
    <View style={st.tabWrap}>
      <MiniPlayer navigation={navigation} />
      <View style={st.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const active = state.index === index;
          return (
            <Pressable
              key={route.key}
              style={st.tabItem}
              onPress={() => {
                buzz();
                navigation.navigate(route.name);
              }}
            >
              {active ? (
                <LinearGradient
                  colors={[C.pink, C.violet]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={st.tabIconOn}
                >
                  <Ionicons name={icons[route.name]} size={19} color={C.white} />
                </LinearGradient>
              ) : (
                <Ionicons name={`${icons[route.name]}-outline` as any} size={21} color={C.muted} />
              )}
              <Text style={[st.tabLabel, active && st.tabLabelOn]}>{route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabNav() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <DollTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Accueil" component={Home} />
      <Tabs.Screen name="Sons" component={Sons} />
      <Tabs.Screen name="Live" component={Live} />
      <Tabs.Screen name="Galerie" component={Galerie} />
      <Tabs.Screen name="Contact" component={Contact} />
    </Tabs.Navigator>
  );
}

function AppShell({ value }: any) {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <Player.Provider value={value}>
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            colors: { ...DefaultTheme.colors, background: C.paper },
          }}
        >
          <Stack.Navigator
            screenOptions={{ headerShown: false, animation: "slide_from_right" }}
          >
            <Stack.Screen name="Tabs" component={TabNav} />
            <Stack.Screen
              name="NowPlaying"
              component={NowPlaying}
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Player.Provider>
    </SafeAreaProvider>
  );
}

function WebStatusBar() {
  return (
    <View style={st.webStatus}>
      <Text style={st.webTime}>9:41</Text>
      <View style={st.webSignals}>
        <Ionicons name="cellular" size={13} color={C.ink} />
        <Ionicons name="wifi" size={13} color={C.ink} />
        <Ionicons name="battery-full" size={15} color={C.ink} />
      </View>
    </View>
  );
}

export default function App() {
  const { width, height } = useWindowDimensions();
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(new Set<string>());

  // progression simulée du lecteur
  useEffect(() => {
    if (!playing || !current) return;
    const total = dur(current.length);
    const id = setInterval(() => {
      setProgress((p) => {
        const nextP = p + 1 / total;
        return nextP >= 1 ? 0 : nextP;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, current]);

  const value = useMemo<PlayerState>(() => {
    const index = () => TRACKS.findIndex((t) => t.id === current?.id);
    return {
      current,
      playing,
      progress,
      liked,
      play: (t: Track) => {
        setCurrent(t);
        setProgress(0);
        setPlaying(true);
      },
      toggle: () => setPlaying((p) => !p),
      next: () => {
        const i = index();
        const n = TRACKS[(i + 1 + TRACKS.length) % TRACKS.length];
        setCurrent(n);
        setProgress(0);
        setPlaying(true);
      },
      prev: () => {
        const i = index();
        const n = TRACKS[(i - 1 + TRACKS.length) % TRACKS.length];
        setCurrent(n);
        setProgress(0);
        setPlaying(true);
      },
      open: () => {},
      like: (id: string) =>
        setLiked((x) => {
          const s = new Set(x);
          s.has(id) ? s.delete(id) : s.add(id);
          return s;
        }),
    };
  }, [current, playing, progress, liked]);

  const framed = Platform.OS === "web" && width > 620;
  if (!framed) return <AppShell value={value} />;
  return (
    <View style={st.webStage}>
      <View style={[st.phoneFrame, { height: Math.min(height - 40, 900) }]}>
        <WebStatusBar />
        <View style={st.phoneScreen}>
          <AppShell value={value} />
        </View>
        <View style={st.homeIndicator} />
      </View>
    </View>
  );
}

/* -------------------------------- Styles --------------------------------- */

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },

  /* top bar / logo */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topKicker: { fontSize: 10, fontWeight: "800", color: C.pink, letterSpacing: 2 },
  topTitle: { fontSize: 24, fontWeight: "900", color: C.ink, letterSpacing: -0.5 },
  logoDot: { width: 26, height: 26, borderRadius: 13, overflow: "hidden" },
  logoText: { fontSize: 20, fontWeight: "900", color: C.ink, letterSpacing: 2 },
  igBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.violet,
  },

  /* hero */
  hero: { paddingHorizontal: 18 },
  heroImg: { height: 430, borderRadius: 30, overflow: "hidden", justifyContent: "space-between" },
  heroTop: { flexDirection: "row", padding: 16 },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.cyan },
  livePillText: { color: C.white, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  heroBottom: { padding: 20 },
  heroGenre: { color: C.cyan, fontSize: 12, fontWeight: "900", letterSpacing: 4, marginBottom: 2 },
  heroName: { color: C.white, fontSize: 52, fontWeight: "900", letterSpacing: -1 },
  heroSlogan: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
    fontWeight: "800",
    fontStyle: "italic",
  },
  heroBtns: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroGhost: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
  },
  heroGhostText: { color: C.white, fontWeight: "800", fontSize: 13 },

  /* buttons */
  glowWrap: {
    shadowColor: C.violet,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  glowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 26,
  },
  glowText: { color: C.white, fontWeight: "900", fontSize: 14, letterSpacing: 0.3 },
  softBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: C.lilac,
    borderWidth: 1,
    borderColor: C.line,
  },
  softBtnText: { color: C.violet, fontWeight: "800", fontSize: 13.5 },

  /* stats */
  stats: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: C.cloud,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "900", color: C.ink },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2, fontWeight: "600" },

  sloganBand: {
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 20,
    overflow: "hidden",
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  sloganText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },

  /* sections */
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 26,
    marginBottom: 14,
  },
  sectionLabel: { fontSize: 10, fontWeight: "900", color: C.pink, letterSpacing: 2 },
  sectionTitle: { fontSize: 21, fontWeight: "900", color: C.ink, marginTop: 2, letterSpacing: -0.3 },
  sectionAction: { fontSize: 12.5, fontWeight: "800", color: C.violet },

  /* feature card */
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 18,
    padding: 12,
    borderRadius: 24,
    backgroundColor: C.cloud,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  featureGlow: { position: "absolute", right: -40, top: -40, width: 140, height: 140, borderRadius: 70, opacity: 0.5 },
  featureArt: { width: 92, height: 92, borderRadius: 18 },
  featureKind: { fontSize: 10.5, fontWeight: "800", color: C.pink, letterSpacing: 1 },
  featureTitle: { fontSize: 19, fontWeight: "900", color: C.ink, marginTop: 2 },
  featureMeta: { fontSize: 12, color: C.muted, marginTop: 2, fontWeight: "600" },
  featurePlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: C.violet,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featurePlayText: { color: C.white, fontWeight: "800", fontSize: 12 },

  /* track rows */
  list: { paddingHorizontal: 18, gap: 10 },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.cloud,
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  trackRowOn: { borderColor: C.violet, backgroundColor: C.lilac },
  trackArtWrap: { width: 52, height: 52, borderRadius: 14, overflow: "hidden" },
  trackArt: { width: "100%", height: "100%" },
  trackArtVeil: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(27,16,48,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  trackMeta: { fontSize: 11.5, color: C.muted, marginTop: 2, fontWeight: "600" },
  trackLen: { fontSize: 12, color: C.muted, fontWeight: "700", marginRight: 4 },
  freshTag: { backgroundColor: C.cyan, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  freshText: { fontSize: 8.5, fontWeight: "900", color: C.ink, letterSpacing: 1 },

  /* filters / chips */
  filterRow: { paddingVertical: 6 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: C.cloud,
    borderWidth: 1,
    borderColor: C.line,
  },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: 13, fontWeight: "800", color: C.muted },
  chipTextOn: { color: C.white },

  shuffle: { marginHorizontal: 18, marginTop: 12, borderRadius: 26, overflow: "hidden" },
  shuffleGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  shuffleText: { color: C.white, fontWeight: "900", fontSize: 14.5, letterSpacing: 0.4 },

  streamCard: {
    margin: 18,
    marginTop: 24,
    padding: 22,
    borderRadius: 24,
    backgroundColor: C.petal,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    gap: 6,
  },
  streamTitle: { fontSize: 18, fontWeight: "900", color: C.ink },
  streamSub: { fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 8, fontWeight: "600" },

  /* mixes */
  mixCard: { width: 210 },
  mixImg: { height: 250, borderRadius: 22, overflow: "hidden", justifyContent: "space-between" },
  mixPlay: {
    margin: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  mixInfo: { padding: 14 },
  mixTitle: { color: C.white, fontSize: 15, fontWeight: "900" },
  mixMeta: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 3, fontWeight: "600" },

  /* shows */
  liveHero: { height: 190, margin: 18, borderRadius: 26, overflow: "hidden", justifyContent: "flex-end", padding: 20 },
  liveHeroKicker: { color: C.white, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  liveHeroTitle: { color: C.white, fontSize: 26, fontWeight: "900", marginTop: 4, lineHeight: 30 },
  liveHeroSlogan: { color: "rgba(255,255,255,0.92)", fontSize: 12.5, fontWeight: "800", fontStyle: "italic", marginTop: 6 },
  showRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.cloud,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 10,
  },
  showRowFirst: { borderColor: C.violet, backgroundColor: C.lilac },
  showDate: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  showDay: { color: C.white, fontSize: 19, fontWeight: "900", lineHeight: 20 },
  showMonth: { color: C.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  showCity: { fontSize: 16, fontWeight: "900", color: C.ink },
  showCountry: { fontSize: 13, color: C.muted, fontWeight: "700" },
  showVenue: { fontSize: 12.5, color: C.muted, marginTop: 2, fontWeight: "600" },
  ticket: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: C.violet,
  },
  ticketOff: { backgroundColor: C.line },
  ticketSoon: { backgroundColor: C.petal },
  ticketText: { fontSize: 12, fontWeight: "900", color: C.white },

  bookCard: {
    margin: 18,
    marginTop: 22,
    padding: 24,
    borderRadius: 26,
    backgroundColor: C.ink,
    alignItems: "center",
    gap: 8,
  },
  bookIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.violet,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bookTitle: { fontSize: 20, fontWeight: "900", color: C.white },
  bookSub: { fontSize: 13, color: C.soft, textAlign: "center", marginBottom: 10, fontWeight: "600" },
  bookMail: { fontSize: 12, color: C.cyan, marginTop: 10, fontWeight: "700" },

  /* gallery */
  masonry: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 6,
    gap: 12,
    justifyContent: "space-between",
  },
  tile: { width: "47%", borderRadius: 20, overflow: "hidden", backgroundColor: C.lilac },
  tileTall: { height: 230 },
  tileShort: { height: 170 },
  tileImg: { width: "100%", height: "100%" },

  /* contact */
  contactHero: { alignItems: "center", paddingTop: 8, paddingBottom: 6 },
  contactAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  contactInitial: { fontSize: 40, fontWeight: "900", color: C.white },
  contactName: { fontSize: 26, fontWeight: "900", color: C.ink, marginTop: 12, letterSpacing: 1 },
  contactRole: { fontSize: 13, color: C.muted, marginTop: 2, fontWeight: "700" },
  contactAlias: { fontSize: 12, color: C.pink, marginTop: 4, fontWeight: "900", letterSpacing: 3 },
  contactSlogan: { fontSize: 12.5, color: C.violet, marginTop: 6, fontWeight: "800", fontStyle: "italic" },

  /* mail bubble */
  mailBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 18,
    marginTop: 16,
    padding: 12,
    borderRadius: 20,
    backgroundColor: C.cloud,
    borderWidth: 1,
    borderColor: C.line,
  },
  mailBubbleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.violet,
    alignItems: "center",
    justifyContent: "center",
  },
  mailBubbleLabel: { fontSize: 14, fontWeight: "900", color: C.ink },
  mailBubbleMail: { fontSize: 12, color: C.muted, marginTop: 2, fontWeight: "700" },

  /* platforms */
  platGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    rowGap: 16,
  },
  platCell: { width: "30%", alignItems: "center", gap: 7 },
  platIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.violet,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  platLabel: { fontSize: 11.5, fontWeight: "800", color: C.ink },
  platPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 16,
    paddingLeft: 6,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: C.cloud,
    borderWidth: 1,
    borderColor: C.line,
  },
  platPillIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  platPillText: { fontSize: 13, fontWeight: "800", color: C.ink },

  formTitle: { fontSize: 17, fontWeight: "900", color: C.ink, marginBottom: 4 },
  socialRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  social: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.lilac,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { paddingHorizontal: 18, paddingTop: 18 },
  formLabel: { fontSize: 12, fontWeight: "800", color: C.ink, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: C.cloud,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: C.ink,
  },
  inputArea: { height: 110, textAlignVertical: "top", paddingTop: 13 },
  formMail: { fontSize: 12, color: C.muted, textAlign: "center", marginTop: 14, fontWeight: "700" },

  /* now playing */
  npBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  npClose: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  npBarText: { color: C.white, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  npArtWrap: { alignItems: "center", marginTop: 20 },
  npDisc: {
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.3)",
  },
  npArt: { width: "100%", height: "100%" },
  npHole: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.paper,
    borderWidth: 4,
    borderColor: "rgba(27,16,48,0.2)",
  },
  npInfo: { alignItems: "center", marginTop: 30 },
  npTitle: { color: C.white, fontSize: 26, fontWeight: "900", letterSpacing: -0.3, textAlign: "center", paddingHorizontal: 20 },
  npArtist: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6, fontWeight: "700" },
  npProgress: { paddingHorizontal: 30, marginTop: 26 },
  npTrack: { height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.28)", justifyContent: "center" },
  npFill: { height: 5, borderRadius: 3, backgroundColor: C.white },
  npKnob: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.white,
    marginLeft: -7,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  npTimes: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  npTime: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "700" },
  npControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 34,
    marginTop: 34,
  },
  npPlay: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  npStream: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: "auto",
    marginBottom: 18,
    marginHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  npStreamText: { color: C.white, fontWeight: "800", fontSize: 13 },

  /* mini player */
  mini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 8,
    borderRadius: 18,
    overflow: "hidden",
  },
  miniArt: { width: 40, height: 40, borderRadius: 12 },
  miniTitle: { color: C.white, fontSize: 13.5, fontWeight: "900" },
  miniArtist: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "700" },
  miniPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* tab bar */
  tabWrap: { backgroundColor: "transparent" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: C.cloud,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 6,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 3 },
  tabIconOn: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: { fontSize: 9.5, color: C.muted, fontWeight: "700" },
  tabLabelOn: { color: C.violet, fontWeight: "900" },

  /* web frame */
  webStatus: {
    height: 28,
    backgroundColor: C.paper,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  webTime: { fontSize: 10, fontWeight: "800", color: C.ink },
  webSignals: { flexDirection: "row", alignItems: "center", gap: 5 },
  webStage: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#e9defb",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  phoneFrame: {
    width: 430,
    maxWidth: "100%",
    backgroundColor: C.ink,
    borderRadius: 42,
    borderWidth: 8,
    borderColor: "#1b1030",
    overflow: "hidden",
    shadowColor: C.violet,
    shadowOpacity: 0.34,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 18 },
    elevation: 18,
  },
  phoneScreen: { flex: 1, width: "100%", overflow: "hidden", backgroundColor: C.paper },
  homeIndicator: {
    position: "absolute",
    bottom: 5,
    left: "50%",
    marginLeft: -53,
    width: 106,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(27,16,48,0.6)",
  },
});
