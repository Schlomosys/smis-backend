<template>
  <div class="academic-timeline">
    <!-- EMPTY STATE -->
    <div v-if="sortedRecords.length === 0" class="alert alert-info d-flex align-items-center">
      <span class="me-2" style="font-size: 1.5rem">📚</span>
      <div>Aucun suivi scolaire enregistré</div>
    </div>

    <!-- TIMELINE CONTAINER -->
    <div v-else class="timeline-wrapper">
      <div class="timeline">
        <!-- TIMELINE ITEM -->
        <div v-for="record in sortedRecords" :key="record.id" class="timeline-item">
          <!-- TIMELINE DOT (colored based on result) -->
          <div :class="['timeline-dot', getResultClass(record.result)]"></div>

          <!-- TIMELINE CONTENT -->
          <div class="timeline-content card border-0 shadow-sm">
            <!-- HEADER: Year + Result Badge -->
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <strong>{{ getAcademicYear(record.year) }}</strong>
              </h6>
              <span :class="['badge', getResultBadgeClass(record.result)]">
                {{ record.result }}
              </span>
            </div>

            <!-- BODY: School, Class, Score, Presence -->
            <div class="card-body small">
              <div class="mb-2">
                <span class="text-muted">École</span><br />
                <strong>{{ record.school?.name || `School #${record.school_id || '?'}` }}</strong>
              </div>

              <div class="row g-2 text-center">
                <div class="col-6 col-md-3">
                  <small class="text-muted d-block">Classe</small>
                  <strong>{{ record.class_name }}</strong>
                </div>

                <div class="col-6 col-md-3">
                  <small class="text-muted d-block">Score</small>
                  <strong>{{ record.score }}/20</strong>
                </div>

                <div class="col-12 col-md-6">
                  <small class="text-muted d-block">Présence</small>
                  <span :class="record.is_present ? 'text-success' : 'text-danger'">
                    <strong>{{ record.is_present ? '✅ Présent' : '❌ Absent' }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD BUTTON (if editable) -->
    <div v-if="editable && sortedRecords.length > 0" class="mt-3 pt-3 border-top">
      <button type="button" class="btn btn-sm btn-success" @click="$emit('add-record')">
        <i class="bi bi-plus-lg"></i>
        Ajouter une année
      </button>
    </div>

    <div v-if="editable && sortedRecords.length === 0" class="mt-3">
      <button type="button" class="btn btn-sm btn-success" @click="$emit('add-record')">
        <i class="bi bi-plus-lg"></i>
        Ajouter une année
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AcademicTimeline',
  props: {
    records: {
      type: Array,
      required: true,
      default: () => [],
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['add-record'],
  computed: {
    sortedRecords() {
      return [...this.records].sort((a, b) => b.year - a.year)
    },
  },
  methods: {
    getAcademicYear(year) {
      return `${year}-${year + 1}`
    },

    getResultClass(result) {
      switch (result) {
        case 'Admis':
          return 'dot-success'
        case 'Redoublant':
          return 'dot-warning'
        case 'Abandon':
          return 'dot-danger'
        case 'En cours':
          return 'dot-info'
        default:
          return 'dot-secondary'
      }
    },

    getResultBadgeClass(result) {
      switch (result) {
        case 'Admis':
          return 'bg-success'
        case 'Redoublant':
          return 'bg-warning text-dark'
        case 'Abandon':
          return 'bg-danger'
        case 'En cours':
          return 'bg-info'
        default:
          return 'bg-secondary'
      }
    },
  },
})
</script>

<style scoped lang="scss">
.academic-timeline {
  .timeline-wrapper {
    position: relative;

    .timeline {
      // Vertical line style
      border-left: 3px solid #dee2e6;
      padding-left: 2rem;
      position: relative;

      .timeline-item {
        position: relative;
        margin-bottom: 2rem;

        // TIMELINE DOT
        .timeline-dot {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #6c757d;
          border: 3px solid white;
          left: -2.595rem;
          top: 0.5rem;
          transition: transform 0.2s ease;

          &:hover {
            transform: scale(1.2);
          }

          // Dot colors based on result
          &.dot-success {
            background-color: #198754;
            box-shadow: 0 0 0 1px rgba(25, 135, 84, 0.2);
          }

          &.dot-warning {
            background-color: #ffc107;
            box-shadow: 0 0 0 1px rgba(255, 193, 7, 0.2);
          }

          &.dot-danger {
            background-color: #dc3545;
            box-shadow: 0 0 0 1px rgba(220, 53, 69, 0.2);
          }

          &.dot-info {
            background-color: #0dcaf0;
            box-shadow: 0 0 0 1px rgba(13, 202, 240, 0.2);
          }

          &.dot-secondary {
            background-color: #6c757d;
            box-shadow: 0 0 0 1px rgba(108, 117, 125, 0.2);
          }
        }

        // TIMELINE CONTENT
        .timeline-content {
          transition:
            box-shadow 0.3s ease,
            transform 0.2s ease;

          &:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .card-header {
            border-bottom: 1px solid #dee2e6;
            padding: 0.75rem 1rem;

            h6 {
              font-size: 0.95rem;
              color: #495057;
            }

            .badge {
              font-weight: 600;
              padding: 0.4rem 0.6rem;
            }
          }

          .card-body {
            padding: 1rem;

            .text-muted {
              font-size: 0.8rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 500;
            }

            strong {
              color: #212529;
            }

            .row {
              div {
                padding: 0.5rem 0;
                border-right: 1px solid #f0f0f0;

                &:last-child {
                  border-right: none;
                }

                @media (max-width: 768px) {
                  border-right: none;
                  border-bottom: 1px solid #f0f0f0;

                  &:last-child {
                    border-bottom: none;
                  }
                }
              }
            }
          }
        }

        // First item spacing
        &:first-child {
          margin-top: 0;
        }

        // Last item - hide timeline line below
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  // ADD BUTTON
  button {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }

    i {
      margin-right: 0.35rem;
    }
  }

  // EMPTY STATE
  .alert {
    border: 1px solid #d1ecf1;
    background-color: #f8f9fa;
  }

  // RESPONSIVE
  @media (max-width: 576px) {
    .timeline-wrapper {
      .timeline {
        padding-left: 1.5rem;

        .timeline-item {
          .timeline-dot {
            left: -2.145rem;
          }

          .timeline-content {
            .card-header {
              flex-direction: column;
              align-items: flex-start;

              h6 {
                margin-bottom: 0.5rem;
              }
            }

            .card-body {
              padding: 0.75rem;

              .row {
                gap: 0.5rem !important;
              }
            }
          }
        }
      }
    }
  }
}
</style>
